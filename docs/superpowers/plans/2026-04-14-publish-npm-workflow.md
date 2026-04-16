# Publish npm workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a manual GitHub Action that publishes the JS package only when a selected `rc-*.*.*` ref matches `js/package.json`, creates tag `js/*.*.*`, and publishes from `js/`.

**Architecture:** One workflow file handles the entire release flow: validate the selected ref, confirm the version matches the package manifest, create/push the release tag, then run install/build/publish inside `js/`. The workflow stays manual (`workflow_dispatch`) so the release can only be triggered by an operator choosing the intended ref in GitHub.

**Tech Stack:** GitHub Actions, bash, Node.js 22, npm, `actions/checkout@v6`, `actions/setup-node@v6`

---

### Task 1: Create the manual publish workflow shell

**Files:**
- Create: `.github/workflows/publish-npm.yaml`

- [ ] **Step 1: Write the workflow skeleton**

```yaml
name: publish-npm-package

on:
  workflow_dispatch:

permissions:
  contents: write
  id-token: write

jobs:
  publish:
    runs-on: ubuntu-24.04

    steps:
      - name: Checkout
        uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 22.x
          registry-url: https://registry.npmjs.org
          cache: npm
          cache-dependency-path: js/package-lock.json

      - name: Upgrade npm for OIDC publishing
        run: |
          npm install -g npm@11.5.1
          npm --version
```

- [ ] **Step 2: Verify the file parses as YAML**

Run: `python - <<'PY'
import yaml, pathlib
path = pathlib.Path('.github/workflows/publish-npm.yaml')
yaml.safe_load(path.read_text())
print('ok')
PY`

Expected: `ok`

- [ ] **Step 3: Commit the workflow shell**

```bash
git add .github/workflows/publish-npm.yaml
git commit -m "feat: add manual npm publish workflow shell"
```

### Task 2: Validate selected ref and package version

**Files:**
- Modify: `.github/workflows/publish-npm.yaml`

- [ ] **Step 1: Add a version validation step**

```yaml
      - name: Validate release ref matches package version
        shell: bash
        run: |
          set -euo pipefail
          REF_NAME='${{ github.ref_name }}'
          case "$REF_NAME" in
            rc-*) ;;
            *) echo "This workflow must be run from an rc-*.*.* ref. Got: $REF_NAME" >&2; exit 1 ;;
          esac

          BRANCH_VERSION="${REF_NAME#rc-}"
          PACKAGE_VERSION="$(node -p "require('./js/package.json').version")"

          if [ "$BRANCH_VERSION" != "$PACKAGE_VERSION" ]; then
            echo "Ref version ($BRANCH_VERSION) does not match js/package.json ($PACKAGE_VERSION)." >&2
            exit 1
          fi

          echo "release_version=$PACKAGE_VERSION" >> "$GITHUB_OUTPUT"
```

- [ ] **Step 2: Verify the step references the selected ref only**

Run: `python - <<'PY'
from pathlib import Path
text = Path('.github/workflows/publish-npm.yaml').read_text()
assert 'github.ref_name' in text
assert 'release_version' in text
assert 'rc-' in text
print('ok')
PY`

Expected: output shows the validation step uses `github.ref_name` and rejects non-`rc-` refs.

- [ ] **Step 3: Commit the validation change**

```bash
git add .github/workflows/publish-npm.yaml
git commit -m "feat: validate release ref against js version"
```

### Task 3: Create the release tag before publishing

**Files:**
- Modify: `.github/workflows/publish-npm.yaml`

- [ ] **Step 1: Add a tag creation step before npm publish**

```yaml
      - name: Create and push release tag
        shell: bash
        run: |
          set -euo pipefail
          TAG_NAME="js/${{ steps.validate.outputs.release_version }}"

          if git ls-remote --exit-code --tags origin "$TAG_NAME" >/dev/null 2>&1; then
            echo "Tag already exists: $TAG_NAME" >&2
            exit 1
          fi

          git tag "$TAG_NAME"
          git push origin "$TAG_NAME"
```

- [ ] **Step 2: Wire the previous step output into the tag step**

```yaml
      - name: Validate release ref matches package version
        id: validate
        shell: bash
        run: |
          set -euo pipefail
          REF_NAME='${{ github.ref_name }}'
          case "$REF_NAME" in
            rc-*) ;;
            *) echo "This workflow must be run from an rc-*.*.* ref. Got: $REF_NAME" >&2; exit 1 ;;
          esac

          BRANCH_VERSION="${REF_NAME#rc-}"
          PACKAGE_VERSION="$(node -p "require('./js/package.json').version")"

          if [ "$BRANCH_VERSION" != "$PACKAGE_VERSION" ]; then
            echo "Ref version ($BRANCH_VERSION) does not match js/package.json ($PACKAGE_VERSION)." >&2
            exit 1
          fi

          echo "release_version=$PACKAGE_VERSION" >> "$GITHUB_OUTPUT"
```

- [ ] **Step 3: Verify tag naming is exactly `js/*.*.*`**

Run: `python - <<'PY'
from pathlib import Path
text = Path('.github/workflows/publish-npm.yaml').read_text()
assert 'TAG_NAME="js/${{ steps.validate.outputs.release_version }}"' in text
assert 'git tag "$TAG_NAME"' in text
assert 'git push origin "$TAG_NAME"' in text
print('ok')
PY`

Expected: the tag step uses `js/${release_version}` and pushes it before publish.

- [ ] **Step 4: Commit the tag logic**

```bash
git add .github/workflows/publish-npm.yaml
git commit -m "feat: tag npm releases before publish"
```

### Task 4: Publish the package from js/

**Files:**
- Modify: `.github/workflows/publish-npm.yaml`

- [ ] **Step 1: Add npm install, build, and publish steps scoped to js/**

```yaml
      - name: Install dependencies
        working-directory: js
        run: npm ci

      - name: Build
        working-directory: js
        run: npm run build

      - name: Publish to npm
        working-directory: js
        run: npm publish --access public --tag latest
```

- [ ] **Step 2: Verify the workflow is manual and publishes from the package folder**

Run: `python - <<'PY'
from pathlib import Path
text = Path('.github/workflows/publish-npm.yaml').read_text()
assert 'workflow_dispatch' in text
assert 'working-directory: js' in text
assert 'npm publish --access public --tag latest' in text
print('ok')
PY`

Expected: only `workflow_dispatch` triggers the workflow, and publish runs inside `js/`.

- [ ] **Step 3: Commit the publish steps**

```bash
git add .github/workflows/publish-npm.yaml
git commit -m "feat: publish js package from manual workflow"
```

### Task 5: Final verification

**Files:**
- Modify: `.github/workflows/publish-npm.yaml` if verification reveals issues

- [ ] **Step 1: Run a final syntax and diff check**

Run: `git diff --check && python - <<'PY'
import yaml, pathlib
path = pathlib.Path('.github/workflows/publish-npm.yaml')
yaml.safe_load(path.read_text())
print('workflow valid')
PY`

Expected: no diff errors and `workflow valid`.

- [ ] **Step 2: Confirm the final workflow matches the requirements**

Checklist:
- manual only (`workflow_dispatch`)
- selected ref must be `rc-*.*.*`
- selected ref version must match `js/package.json`
- tag name is `js/<version>`
- tag is created/pushed before publish
- publish runs from `js/`

---

## Self-Review

### Spec coverage
- Manual dispatch: Task 1, Task 4
- Ref version validation: Task 2
- Tag before publish: Task 3
- Publish `js` package: Task 4

### Placeholder scan
- No TBD/TODO placeholders.

### Type consistency
- Workflow step output name is `release_version` everywhere it is referenced.
