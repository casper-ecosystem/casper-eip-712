# X announcement drafts — Task 327

## @Casper_Network thread

### Tweet 1
We just open-sourced EIP-712 for Casper. Here's why it matters 🧵

If Casper is going to power gasless UX, secure cross-chain flows, and agentic commerce, we need standard, domain-separated signatures — not bespoke byte blobs.

### Tweet 2
This work started while hardening the Casper↔EVM bridge after security review.

Instead of patching one protocol in isolation, we built reusable infrastructure for the whole ecosystem:
`casper-eip-712`

Casper now speaks one of the most important signing standards in Web3.

### Tweet 3
What it unlocks:
- gasless transactions & relayers
- permit / approve flows
- safer cross-chain attestations
- batch authorizations
- agentic commerce via x402
- better onboarding for users who don't hold CSPR yet

### Tweet 4
Built for both Rust contracts and TS frontends.

- Blog: [link]
- GitHub: https://github.com/casper-ecosystem/casper-eip-712
- Crate: https://crates.io/crates/casper-eip-712
- NPM: https://www.npmjs.com/package/@casper-ecosystem/casper-eip-712

## @mssteuer signal boost

Wrote about why we brought EIP-712 to Casper.

Started with a security audit. Ended with infrastructure that unlocks gasless UX, agentic transactions, cross-chain attestations, and a much cleaner path for developers building on Casper.

If you're building on Casper — use it.
If you're building on Ethereum and wondering what else is out there — try it.

[link]
