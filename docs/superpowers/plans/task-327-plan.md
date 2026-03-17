# Blog Post: "Why We Brought Ethereum's Most Important Signing Standard to Casper" — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write and publish a ~2,500–3,000 word technical blog post introducing `casper-eip-712` to the Casper developer community, written in Michael Steuer's voice.

**Architecture:** Research source materials (crate README, Halborn audit context, Michael's prior articles for voice), draft each section in sequence, review for voice/accuracy, format for Medium, prepare cross-post and X announcement drafts.

**Tech Stack:** Markdown (blog draft), Medium (primary publication), dev.to (cross-post), X/Twitter (announcements)

---

## Agreed Design Summary

**Title:** "Why We Brought Ethereum's Most Important Signing Standard to Casper"
**Byline:** Michael Steuer
**Target length:** ~2,500–3,000 words (10–12 min read)
**Target audience:** Both EVM and Casper developers + ecosystem observers, leading with "Casper speaks EVM standards"

### Writing Voice (Michael Steuer)
Analyzed from three published articles:
- **Conversational but authoritative** — explains to a smart peer, not lecturing
- **Opens with relatable problems** — "The Web3 UX sucks", "So I decided to prove it"
- **Self-deprecating humor** — "drink my own kool-aid", "put the rubber to the road"
- **Pop culture / tech history references** — BeOS, Nokia NGage, Google Glass
- **Strong opinions stated confidently** — "pretty bold statement", "turns out we weren't exaggerating"
- **Personal narrative thread** — "one late night about two months ago, I decided..."
- **Builder credibility** — shows what was built, how, and why it matters
- **Bold headers that tell a story**, not just label sections

### Section Structure (Approved)

1. **Opening Hook** (200–300w) — Thesis: every blockchain needs EIP-712. Casper has it now. Origin tease: "started with a security auditor telling us we had a gap."
2. **The Problem — Why Roll-Your-Own Signatures Fail** (300–400w) — Replay vulnerabilities, the Halborn audit, "Security auditors don't tell you what's nice to have."
3. **EIP-712 Primer** (400–500w) — Typed structured data, domain separation, why Ethereum adopted it. "If you've built on Ethereum, you've used this."
4. **casper-eip-712 — How We Brought It to Casper** (500–600w) — DomainBuilder, Eip712Struct, hash_typed_data code examples. no_std compatible. Casper-native domain fields. **Odra compatibility paragraph:** standalone crate by design, integrates seamlessly with Odra contracts.
5. **Real-World Usage — The Bridge** (300–400w) — CSPRbridge.com attestation verification. "We didn't just patch the finding. We built infrastructure."
6. **TypeScript Companion** (200–300w) — npm package, signing code snippet, link to demo.
7. **Demo — Permit/Approve Pattern** (300–400w) — CEP-18 permit token walkthrough. **Odra proof point:** demo IS an Odra contract. Show `cargo odra test` + TypeScript demo side by side. "Run this without a Casper node. Right now. Go."
8. **What This Unlocks for Casper** (400–500w) — Gasless txs, x402 agentic commerce, cross-chain interop, non-crypto-native onboarding. "This isn't just a library. It's a building block."
9. **CTA** (100–150w) — All links. "If you're building on Casper — use it. If you're building on Ethereum and wondering what else is out there — try it."

### Images (2)
1. **Architecture diagram** — EIP-712 signing flow: User signs typed data off-chain → Relayer submits to Casper contract → Contract verifies + recovers signer
2. **Domain separator comparison** — Side-by-side: EVM domain (chainId, verifyingContract) vs Casper-native domain (chain_name, contract_package_hash)

### Publication Plan
- Primary: Medium (Michael's account or Casper Association blog)
- Cross-post: dev.to
- X: @Casper_Network tweet thread (3–4 tweets) + @mssteuer personal signal boost

---

## Source Materials

The writing agent MUST read these before drafting:

| Material | Location | Purpose |
|----------|----------|---------|
| Crate README | https://docs.rs/crate/casper-eip-712/1.0.0/source/README.md | API examples, future use cases, repo structure |
| GitHub repo | https://github.com/casper-ecosystem/casper-eip-712 | Source code, examples, demo |
| NPM package | https://www.npmjs.com/package/@casper-ecosystem/casper-eip-712 | TypeScript API |
| Rust docs | https://docs.rs/casper-eip-712/1.0.0/casper_eip_712/ | Full API reference |
| Permit token example | https://github.com/casper-ecosystem/casper-eip-712/tree/master/examples/permit-token | Demo code for Section 7 |
| Michael's CSPR.click article | https://medium.com/csprsuite/enabling-web3-adoption-with-cspr-click-8c551875985a | Voice reference |
| Michael's "Not Exaggerating" article | https://medium.com/@mssteuer/turns-out-we-werent-exaggerating-who-could-ve-predicated-that-ffa4b794ab65 | Voice reference |
| Halborn audit context | `/home/jeanclaude/.openclaw/workspace/reference/halborn-audit.md` | FIND-223, FIND-224 details |
| cspr-bridge crypto.rs | `/home/jeanclaude/workspace/cspr-bridge/contracts/casper/src/crypto.rs` | Before-state: ad-hoc encodePacked hashing |
| Odra framework | https://odra.dev/docs/ | For Odra plug/link |
| EIP-712 spec | https://eips.ethereum.org/EIPS/eip-712 | For primer accuracy |

---

## Chunk 1: Research & Draft

### Task 1: Research Source Materials

**Files:**
- Read: All source materials listed above
- Create: `/tmp/blog-327-research-notes.md` (working notes, not committed)

- [ ] **Step 1: Read the crate README**
  Fetch https://docs.rs/crate/casper-eip-712/1.0.0/source/README.md
  Extract: Quick start code, custom struct example, Casper-native domain example, future use cases section (gasless, x402, cross-chain), feature flags, no_std note.

- [ ] **Step 2: Read the permit-token example**
  Fetch https://github.com/casper-ecosystem/casper-eip-712/tree/master/examples/permit-token
  Extract: How the demo works, Odra contract structure, demo.ts commands, `cargo odra test` usage.

- [ ] **Step 3: Read the TypeScript package**
  Fetch https://www.npmjs.com/package/@casper-ecosystem/casper-eip-712
  Extract: TypeScript API, signing example that matches Rust verification.

- [ ] **Step 4: Read Michael's voice reference articles**
  Fetch both Medium articles. Note: tone, sentence structure, humor style, how he introduces technical concepts, his use of rhetorical questions, how he structures arguments.

- [ ] **Step 5: Read Halborn audit context**
  Read `/home/jeanclaude/.openclaw/workspace/reference/halborn-audit.md`
  Extract: FIND-223 (erc20_locker not bound), FIND-224 (no deployment-specific domain). Keep audit details at category level — do NOT quote specific vulnerability details publicly.

- [ ] **Step 6: Read the existing cspr-bridge crypto.rs**
  Read `/home/jeanclaude/workspace/cspr-bridge/contracts/casper/src/crypto.rs`
  Extract: The 4 attestation hash functions that use raw keccak256(encodePacked) — this is the "before" state for the bridge story.

- [ ] **Step 7: Compile research notes**
  Save key quotes, code snippets, and structural notes to working file. This is reference material for drafting.

---

### Task 2: Draft Section 1 — Opening Hook

**Files:**
- Create: `blog-drafts/task-327-eip712-blog.md`

- [ ] **Step 1: Write the opening hook (200–300 words)**

  Content requirements:
  - Punchy thesis: every blockchain that wants cross-chain commerce, gasless UX, and agentic transactions needs EIP-712. Casper has it now.
  - Brief framing: domain-separated typed data is becoming the lingua franca of crypto signatures
  - Origin tease: "This didn't start as a roadmap item. It started with a security auditor telling us we had a gap."
  - Michael's voice: confident, direct, slightly provocative opening

- [ ] **Step 2: Self-review for voice match**
  Compare against Michael's article openings. Check for: too formal? Too AI-sounding? Would Michael actually say this? Remove any "I'd be happy to" or "Let's explore" patterns.

---

### Task 3: Draft Section 2 — The Problem

- [ ] **Step 1: Write "Why Roll-Your-Own Signatures Fail" (300–400 words)**

  Content requirements:
  - Without a standard → replay vulnerabilities, incompatibility, wallet UX nightmares
  - Concrete example: bridge attestation for Chain A replayed on Chain B
  - Connect to Halborn audit at category level (not specific finding numbers)
  - Quote-worthy line: "Security auditors don't tell you what's nice to have. They tell you what will get you exploited."

---

### Task 4: Draft Section 3 — EIP-712 Primer

- [ ] **Step 1: Write "What It Is and Why Ethereum Got It Right" (400–500 words)**

  Content requirements:
  - What EIP-712 does: typed structured data hashing + signing (vs opaque byte blobs)
  - Three properties: human-readable in wallets, domain-separated, machine-verifiable
  - Why Ethereum adopted it: ERC-2612 permits (Uniswap, Aave, OpenSea), gasless approvals
  - Dual-audience callout: "If you've built on Ethereum, you've used this. If you're building on Casper, you're about to."
  - NO code in this section — conceptual only

---

### Task 5: Draft Section 4 — casper-eip-712 Technical Deep Dive

- [ ] **Step 1: Write "How We Brought It to Casper" (500–600 words)**

  Content requirements:
  - DomainBuilder code example (both EVM-compatible and Casper-native)
  - Eip712Struct trait — show custom Attestation struct
  - hash_typed_data() — the core function
  - Key design decisions: no_std, optional verify feature
  - Casper-native innovation: custom domain fields
  - **Odra paragraph:** "We built casper-eip-712 as a standalone Rust crate, not an Odra module. This was intentional: any Casper contract can use it, regardless of framework. But since most contracts on Casper are developed using Odra — the rapid-development smart contracting framework — we made sure it integrates seamlessly. Add it to your Cargo.toml, import the prelude, and you're signing."
  - Link to Odra: https://odra.dev

  Code snippets to include (from README):
  ```rust
  // DomainBuilder — EVM compatible
  let domain = DomainBuilder::new()
      .name("MyToken")
      .version("1")
      .chain_id(1)
      .verifying_contract([0x11; 20])
      .build();

  // Casper-native domain
  let domain = DomainBuilder::new()
      .name("Bridge")
      .version("1")
      .custom_field("chain_name", DomainFieldValue::String("casper-test".into()))
      .custom_field("contract_package_hash", DomainFieldValue::Bytes32([0x99; 32]))
      .build();

  // Custom struct
  impl Eip712Struct for Attestation {
      fn type_string() -> &'static str {
          "Attestation(address subject,bytes32 claim_hash)"
      }
      // ...
  }
  ```

---

### Task 6: Draft Section 5 — Bridge Usage

- [ ] **Step 1: Write "Real-World Usage — The Bridge" (300–400 words)**

  Content requirements:
  - How CSPRbridge.com uses it for attestation verification
  - Origin story payoff: audit → gap → built the tool → bridge uses it
  - "We didn't just patch the finding. We built infrastructure so that every project on Casper gets this right by default."
  - Keep Halborn references at category level (no FIND numbers in the blog)

---

### Task 7: Draft Section 6 — TypeScript Companion

- [ ] **Step 1: Write "TypeScript Companion" (200–300 words)**

  Content requirements:
  - @casper-ecosystem/casper-eip-712 npm package
  - Brief code snippet showing TypeScript signing that matches Rust verification
  - Link to standalone demo
  - "Frontend devs don't need to touch Rust. The TypeScript package mirrors the API."

---

### Task 8: Draft Section 7 — Demo

- [ ] **Step 1: Write "Demo — Permit/Approve Pattern" (300–400 words)**

  Content requirements:
  - Step-by-step walkthrough of the CEP-18 permit token
  - User signs Permit off-chain → relayer submits → contract verifies and executes
  - **Odra proof point:** "The demo is a CEP-18 token built with Odra. The EIP-712 permit pattern drops in as a regular crate dependency — no special adapters, no glue code."
  - Include demo commands:
    ```bash
    cd js && npm install && npm run build && cd ..
    cd examples/permit-token/demo
    npm install
    npx tsx demo.ts
    ```
  - For Odra tests: `cargo odra test`
  - "You can run this demo without a Casper node. Right now. Go."

---

### Task 9: Draft Section 8 — What This Unlocks

- [ ] **Step 1: Write "What This Unlocks for Casper" (400–500 words)**

  Content requirements:
  - Gasless transactions & relayer services — new users without CSPR
  - Agentic commerce via x402 — AI agents signing structured authorizations
  - Cross-chain interoperability — hybrid domain separators
  - Batch authorization — relayers collect multiple permits
  - Non-crypto-native onboarding — remove "buy gas first" barrier
  - Positioning statement: "This isn't just a library. It's a building block that positions Casper to compete for the next wave of adoption — where users don't know they're using a blockchain, and agents transact on their behalf."
  - Draw from the Future Use Cases section of the crate README

---

### Task 10: Draft Section 9 — CTA

- [ ] **Step 1: Write "Build With Us" CTA (100–150 words)**

  Include all links:
  - GitHub: https://github.com/casper-ecosystem/casper-eip-712
  - Rust crate: https://crates.io/crates/casper-eip-712
  - NPM: https://www.npmjs.com/package/@casper-ecosystem/casper-eip-712
  - Docs: https://docs.rs/casper-eip-712/1.0.0/casper_eip_712/
  - Demo: https://github.com/casper-ecosystem/casper-eip-712/tree/master/examples/permit-token

  Closing line: "If you're building on Casper — use it. If you're building on Ethereum and wondering what else is out there — try it. The signatures are the same."

---

## Chunk 2: Review, Polish & Publication Assets

### Task 11: Full Draft Review

- [ ] **Step 1: Read the complete draft end-to-end**
  Check for: narrative flow between sections, consistent voice, no repetition, appropriate technical depth.

- [ ] **Step 2: Voice check**
  Compare key paragraphs against Michael's published articles. Flag anything that sounds AI-generated, overly formal, or sycophantic. Michael doesn't use: "Let's dive in", "In this article we'll explore", "I'm excited to share". He DOES use: direct statements, rhetorical questions, pop culture references, builder credibility.

- [ ] **Step 3: Technical accuracy check**
  Verify all code snippets match the actual crate API (from README/docs.rs). Verify Halborn references are category-level only. Verify all links are correct and live.

- [ ] **Step 4: Word count check**
  Target: 2,500–3,000 words total. If over, trim the primer or future use cases section. If under, expand the bridge story or demo walkthrough.

---

### Task 12: Format for Medium

- [ ] **Step 1: Format the draft for Medium**
  - Use Medium-compatible markdown (headers, bold, code blocks, links)
  - Add image placement markers: `[IMAGE 1: Architecture diagram — EIP-712 signing flow]` and `[IMAGE 2: Domain separator comparison — EVM vs Casper-native]`
  - Ensure code blocks will render properly on Medium (use triple backticks with language tags)
  - Add Medium-specific metadata suggestions: tags (Blockchain, Casper Network, EIP-712, Web3, Smart Contracts), subtitle

- [ ] **Step 2: Save Medium-formatted version**
  Save to: `blog-drafts/task-327-eip712-blog-medium.md`

---

### Task 13: Prepare dev.to Cross-Post

- [ ] **Step 1: Adapt for dev.to format**
  - Add dev.to front matter (title, published, description, tags, cover_image, canonical_url)
  - Tags: blockchain, rust, typescript, webdev
  - canonical_url should point to the Medium post (once published)

- [ ] **Step 2: Save dev.to version**
  Save to: `blog-drafts/task-327-eip712-blog-devto.md`

---

### Task 14: Draft X Announcements

- [ ] **Step 1: Draft @Casper_Network tweet thread (3–4 tweets)**
  Tweet 1: Hook — "We just open-sourced EIP-712 for Casper. Here's why it matters 🧵"
  Tweet 2: The problem — roll-your-own signatures, replay attacks, security
  Tweet 3: What it enables — gasless transactions, agentic commerce, cross-chain bridges
  Tweet 4: CTA — links to blog post, GitHub repo, npm package

- [ ] **Step 2: Draft @mssteuer signal boost tweet**
  Personal voice. "Wrote about why we brought EIP-712 to Casper. Started with a security audit. Ended with infrastructure that unlocks gasless UX, agentic transactions, and real cross-chain interop. [link]"

- [ ] **Step 3: Save announcement drafts**
  Save to: `blog-drafts/task-327-x-announcements.md`

---

### Task 15: Image Descriptions

- [ ] **Step 1: Write detailed image descriptions for designer**

  **Image 1 — Architecture Diagram:**
  Title: "EIP-712 Gasless Signing Flow"
  Shows: User (wallet icon) → "Signs typed data off-chain (zero cost)" → Typed Data box showing field names → Arrow to "Relayer submits to Casper contract" → Casper contract box → "Verifies signature, recovers signer, executes action"
  Style: Clean, minimal, Casper brand colors. Left-to-right flow.

  **Image 2 — Domain Separator Comparison:**
  Title: "Same Standard, Extended for Casper"
  Shows: Two columns side-by-side.
  Left: "EVM Domain" — name: "CasperBridge", version: "1", chainId: 11155111, verifyingContract: 0xAb...
  Right: "Casper-Native Domain" — name: "Bridge", version: "1", chain_name: "casper-test", contract_package_hash: 0x99...
  Shared header: "DomainBuilder supports both"
  Style: Code-card style, Casper brand colors.

- [ ] **Step 2: Save image descriptions**
  Save to: `blog-drafts/task-327-image-specs.md`

---

## Chunk 3: Final Assembly & Delivery

### Task 16: Final Assembly

- [ ] **Step 1: Compile all deliverables**
  Verify these files exist and are complete:
  - `blog-drafts/task-327-eip712-blog.md` (canonical draft)
  - `blog-drafts/task-327-eip712-blog-medium.md` (Medium-formatted)
  - `blog-drafts/task-327-eip712-blog-devto.md` (dev.to-formatted)
  - `blog-drafts/task-327-x-announcements.md` (tweet drafts)
  - `blog-drafts/task-327-image-specs.md` (image descriptions)

- [ ] **Step 2: Final word count and link verification**
  Run word count on canonical draft. Verify all URLs resolve (fetch each one).

- [ ] **Step 3: Commit all deliverables**
  ```bash
  git add blog-drafts/task-327-*
  git commit -m "content: Blog post draft — Why We Brought Ethereum's Most Important Signing Standard to Casper"
  ```

---

## Proposed Acceptance Criteria

- [ ] Blog post draft is 2,500–3,000 words
- [ ] Written in Michael Steuer's voice (verified against reference articles)
- [ ] Contains code examples from the actual casper-eip-712 crate (verified against README/docs)
- [ ] Mentions Odra compatibility in Section 4 and Section 7
- [ ] Halborn audit referenced at category level only (no FIND numbers, no specific vulnerability details)
- [ ] All 9 sections present per agreed structure
- [ ] Medium-formatted version ready for paste
- [ ] dev.to version with front matter ready for paste
- [ ] @Casper_Network tweet thread (3–4 tweets) drafted
- [ ] @mssteuer signal boost tweet drafted
- [ ] Image descriptions written for 2 images
- [ ] All links verified (GitHub, crates.io, npm, docs.rs, demo)
