# Proposal: Casper-Native Permit Support in casper-eip-712

**Author:** Michael Steuer
**Date:** March 2026
**Status:** Draft for discussion (Michael, Maciej, Ihor, Krzysztof)

## Context

`casper-eip-712` was built to bring EIP-712 typed data signing to Casper, initially driven by the Halborn audit of CSPRbridge. The crate provides domain-separated, structured hashing and secp256k1 signer recovery, matching the Ethereum EIP-712 standard exactly.

Separately, Krzysztof built a working x402 proof-of-concept ([odradev/casper-x402-poc](https://github.com/odradev/casper-x402-poc)) that implements `transfer_with_authorization` using Casper-native keys and Odra's built-in `verify_signature`.

The question on the table: how should permits and authorized transfers work on Casper going forward, and where does `casper-eip-712` fit?

## Two Signing Worlds

### Ethereum-origin signatures (bridge, cross-chain)

- Signer uses secp256k1 (MetaMask, ethers.js)
- Identified by 20-byte Ethereum address
- Contract must **recover** the signer address from the signature
- EIP-712 domain separation binds signatures to specific chain + contract
- `casper-eip-712` handles this today via `recover_eth_address`

### Casper-native signatures (x402, on-chain permits)

- Signer uses ed25519 or secp256k1 (Casper Wallet, Casper Signer)
- Identified by AccountHash (derived from PublicKey)
- PublicKey is passed explicitly; contract **verifies** rather than recovers
- Casper runtime provides `verify_signature` natively via `env()`
- Krzysztof's x402 POC uses this approach with a custom message format

## What Krzysztof's x402 POC Does Well

The x402 POC contract (`cep18_x402.rs`) is clean and correct:

1. Caller passes `from`, `to`, `amount`, `valid_after`, `valid_before`, `nonce`, `public_key`, `signature`
2. Contract checks `AccountHash::from(&public_key) == from` (key ownership)
3. Contract builds a deterministic message from the fields
4. Contract calls `env.verify_signature(&message, &signature, &public_key)`
5. Replay protection via nonce mapping
6. Time window enforcement

This works. The open question is whether the message format should be standardized.

## The Gap

Krzysztof's POC uses a custom message format:

```
b"casper-x402-v2:" || from_hash(32) || to_hash(32) || amount(32) || valid_after(8) || valid_before(8) || nonce(32)
```

This is fine for a single contract, but as more contracts adopt authorized transfers (permits, meta-transactions, delegated actions), each will invent its own message format. This is exactly the problem EIP-712 was created to solve on Ethereum: without a shared standard for structured message hashing, you get fragmentation, replay risks across contracts, and wallets that can't display what users are signing.

## Proposal

Extend `casper-eip-712` to support Casper-native signing while keeping the EIP-712 typed data hashing standard as the common message format.

### What stays the same

- EIP-712 typed data hashing (domain separator, type hashes, struct encoding)
- `DomainBuilder` with both EVM and Casper-native fields
- `Eip712Struct` trait for custom message types
- `recover_eth_address` for bridge/cross-chain use cases
- TypeScript companion package with matching hashes

### What gets added

**1. `verify_casper_signer` function (Rust crate)**

```rust
/// Verify that a Casper public key signed an EIP-712 typed data digest.
/// Returns Ok(AccountHash) on success.
pub fn verify_casper_signer(
    domain: &Domain,
    message: &impl Eip712Struct,
    public_key: &PublicKey,
    signature: &[u8],
) -> Result<AccountHash, Error> {
    let digest = hash_typed_data(domain, message);
    casper_types::crypto::verify(&digest, signature, public_key)?;
    Ok(AccountHash::from(public_key))
}
```

This gives contracts the same EIP-712 structured hashing but with Casper-native signature verification. No eth address recovery involved.

**2. Prebuilt `TransferAuthorization` struct**

```rust
/// EIP-3009/x402-style transfer authorization for Casper.
pub struct TransferAuthorization {
    pub from: [u8; 32],       // AccountHash
    pub to: [u8; 32],         // AccountHash
    pub value: [u8; 32],      // U256
    pub valid_after: u64,
    pub valid_before: u64,
    pub nonce: [u8; 32],
}
```

With `Eip712Struct` implemented, so any contract can use it out of the box.

**3. Batch authorization struct (for x402 multi-transfer)**

```rust
/// Batch authorization: one signature covers multiple transfers.
/// Useful for x402 (pay recipient + pay facilitator fee in one signature).
pub struct BatchTransferAuthorization {
    pub from: [u8; 32],
    pub transfers: Vec<TransferEntry>,  // (to, value) pairs
    pub valid_after: u64,
    pub valid_before: u64,
    pub nonce: [u8; 32],
}
```

This addresses Michael's suggestion of permitting multiple transfers at once (e.g., one to the recipient, one to the facilitator).

**4. TypeScript companion updates**

Mirror the new structs and verification in the TS package so frontend/agent code can construct and sign these messages using Casper SDK or Casper Wallet.

### What Casper Wallet gets

With EIP-712 typed data, Casper Wallet can display human-readable signing prompts:

```
Transfer Authorization
  From: account-hash-abc123...
  To: account-hash-def456...
  Value: 1,000 CSPR
  Valid until: 2026-03-18 00:00 UTC
  Nonce: 0x01020304...
```

Instead of asking users to sign an opaque byte blob. This is the same UX improvement that EIP-712 brought to MetaMask.

## How This Relates to the Bridge

The bridge continues to use `recover_eth_address` for verifying Ethereum-origin relayer attestations. Nothing changes there.

The Casper-native path is additive. Both coexist in the same crate behind feature flags:

- `verify` feature: secp256k1 eth address recovery (existing, for bridge)
- `casper-native` feature: Casper `PublicKey` + `verify_signature` path (new)
- Core hashing (no features needed): works for both

## Migration Path for x402 POC

1. Replace custom `b"casper-x402-v2:"` message format with EIP-712 `TransferAuthorization` struct
2. Replace manual `build_message` with `hash_typed_data(&domain, &transfer_auth)`
3. Replace `env.verify_signature` with `verify_casper_signer` (or keep using `env.verify_signature` directly on the EIP-712 digest)
4. Add domain separator to bind authorizations to the specific x402 token contract and chain
5. Gain: replay protection across contracts for free via domain separation

## Open Questions for Discussion

1. **Should `BatchTransferAuthorization` be part of the crate or a separate x402-specific package?** Argument for inclusion: batch permits are useful beyond x402. Argument against: keep the core crate minimal.

2. **EIP-712 nested struct hashing for batch transfers.** EIP-712 supports arrays of structs via `hashStruct` over each element. Do we implement full nested type hashing, or keep it flat with a simpler encoding?

3. **Wallet integration timeline.** The real UX win requires Casper Wallet to parse and display EIP-712 typed data. Is this on the roadmap?

4. **Should the `casper-native` feature depend on `casper-types` directly, or should we keep it abstract?** Direct dependency simplifies things but couples the crate to a specific Casper SDK version.

5. **Naming.** Maciej's question "what is the point of `recover_eth_address`?" highlights that the function name is confusing in a Casper context. Should we namespace more clearly, e.g., `evm::recover_address` vs `casper::verify_signer`?

## Summary

| Use Case | Signing | Identity | Crate Feature | Status |
|----------|---------|----------|---------------|--------|
| Bridge attestations | secp256k1 (eth) | Eth address (20 bytes) | `verify` | ✅ Shipped |
| Cross-chain messages | secp256k1 (eth) | Eth address (20 bytes) | `verify` | ✅ Shipped |
| x402 payments | ed25519/secp256k1 (Casper) | AccountHash (32 bytes) | `casper-native` | Proposed |
| Casper-native permits | ed25519/secp256k1 (Casper) | AccountHash (32 bytes) | `casper-native` | Proposed |
| Batch authorizations | ed25519/secp256k1 (Casper) | AccountHash (32 bytes) | `casper-native` | Proposed |

The core value proposition: **one standard for structured message hashing across all Casper use cases**, whether the signer is an Ethereum wallet, a Casper wallet, or an AI agent.
