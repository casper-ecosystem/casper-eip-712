# Image descriptions — Task 327 EIP-712 blog

## Image 1 — Architecture Diagram

**Title:** EIP-712 Gasless Signing Flow

**Purpose:** Visualize the core off-chain authorization flow that the blog discusses.

**Layout:** Clean left-to-right flow diagram with 4 main blocks and directional arrows.

**Blocks:**
1. **User / Wallet**
   - Wallet icon or user avatar with wallet
   - Label: `User signs typed data off-chain`
   - Sub-label: `Zero cost • No gas required`
2. **Typed Data Payload**
   - Code-card style box showing a simplified Permit message
   - Example fields:
     - `owner`
     - `spender`
     - `value`
     - `nonce`
     - `deadline`
   - Small header above it: `EIP-712 structured message`
3. **Relayer / Backend**
   - Label: `Relayer submits signed authorization`
   - Sub-label: `Pays deploy cost on user's behalf`
4. **Casper Contract**
   - Label: `Casper contract verifies signature`
   - Sub-label: `Rebuilds digest • Recovers signer • Executes action`

**Footer callout:** `Same signature standard, verified on Casper`

**Visual style:**
- Modern, minimal, technical
- Casper brand colors / gradients where appropriate
- Clear arrows between stages
- Slight emphasis on the off-chain → on-chain transition
- Should feel polished enough for Medium and social cut-downs

## Image 2 — Domain Separator Comparison

**Title:** Same Standard, Extended for Casper

**Purpose:** Show that Casper uses the EIP-712 model while extending it with Casper-native domain fields.

**Layout:** Two side-by-side code cards with a shared heading.

**Shared heading:** `DomainBuilder supports both EVM and Casper-native domains`

**Left card title:** EVM Domain

**Left card contents:**
```text
name: "CasperBridge"
version: "1"
chainId: 11155111
verifyingContract: 0xAb...12
```

**Right card title:** Casper-Native Domain

**Right card contents:**
```text
name: "Bridge"
version: "1"
chain_name: "casper-test"
contract_package_hash: 0x99...ff
```

**Bottom caption:** `Domain separation binds signatures to the intended deployment context`

**Visual style:**
- Code-card aesthetic
- Strong visual symmetry between left and right cards
- Casper brand colors, but preserve contrast and readability
- Optional subtle badge or connector text between cards: `Same EIP-712 model`

## General designer notes
- Optimize for Medium article width first, with the option to crop snippets for X or other socials.
- Keep text large enough to remain legible in embedded article view.
- Avoid clutter. These should support the article, not compete with it.
