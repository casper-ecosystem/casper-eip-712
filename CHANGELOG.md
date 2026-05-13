# Changelog

This repository is a monorepo. Each package maintains its own changelog:

- **Rust crate** (`casper-eip-712`) — see below
- **npm package** (`@casper-ecosystem/casper-eip-712`) — [js/CHANGELOG.md](js/CHANGELOG.md)
- **Go module** (`github.com/casper-ecosystem/casper-eip-712/go`) — [go/CHANGELOG.md](go/CHANGELOG.md)

---

## casper-eip-712 (Rust crate)

All notable changes to the Rust crate are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-04-26

### Added

- **`casper-native` feature flag** (optional, depends on `casper-types v7`): new `casper_native` module exposing:
  - `TransferAuthorization` — EIP-3009-style single-transfer struct with `Eip712Struct` implementation and Casper `PublicKey` verification.
  - `BatchTransferAuthorization` — x402-compatible multi-transfer struct.
  - 13 new unit tests; all 58 existing tests continue to pass.

## [1.1.0] - 2026-04-09

### Added

- `Address` enum with two variants: `Address::Eth([u8; 20])` (left-padded to 32 bytes) and `Address::Casper([u8; 33])` (keccak256-hashed to 32 bytes). `encode_address` updated accordingly; all struct fields and integration tests migrated.
- New cross-language test vector for a 33-byte Casper address in a `Permit` message, validated against `tests/vectors.json`.

## [1.0.0] - 2026-03-16

### Added

- Initial release of the `casper-eip-712` Rust crate.
- Full EIP-712 encoding pipeline: `encodeType`, `encodeData`, `hashStruct`, `hashTypedData`, and domain separator hashing.
- Pre-built message types: `Permit`, `Approval`, and `Transfer`.
- Shared `tests/vectors.json` cross-language test vectors, validated by both Rust and TypeScript test suites.
- `permit-token` example contract demonstrating the EIP-712 permit/approve pattern on Casper.
