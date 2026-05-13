# Changelog — @casper-ecosystem/casper-eip-712

All notable changes to the npm package are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-05-10

### Added

- `buildCanonicalTypeString` is now exported from the public API, allowing callers to inspect or reuse the EIP-712 canonical type string (e.g. for `computeTypeHash` or debugging).

### Changed

- Adopt the [CAIP-2](https://github.com/ChainAgnostic/namespaces/blob/main/casper/caip2.md) format (`casper:<chainspec_name>`) as the recommended value for `chain_name` in Casper-native EIP-712 domain separators. Example and test literals updated from `"casper-test"` / `"casper"` to `"casper:casper-test"` / `"casper:casper"`.

## [1.2.0] - 2026-04-26

### Added

- `TransferAuthorization` and `BatchTransferAuthorization` TypeScript companion types (mirrors the Rust `casper-native` feature), exported from the package root.
- `viem` signing demo.

## [1.1.0] - 2026-04-09

### Added

- `encodeAddress` extended to accept 33-byte Casper public keys, encoding them via keccak256 (mirrors the Rust `Address::Casper` variant).
- New cross-language test vector for a 33-byte Casper address in a `Permit` message.

## [1.0.1] - 2026-03-17

### Fixed

- `PermitMessage`, `ApprovalMessage`, and `TransferMessage` now extend `Record<string, unknown>`, satisfying the index signature required by `hashTypedData`, `hashStruct`, and `recoverTypedDataSigner` without explicit casts at call sites (resolves `TS2345`).

## [1.0.0] - 2026-03-16

### Added

- Initial release of `@casper-ecosystem/casper-eip-712`.
- EIP-712 encoding pipeline: `computeTypeHash`, `hashStruct`, `hashTypedData`.
- Domain separator hashing with auto-inference (`hashDomain`, `rawDigest`).
- Signature recovery: `recoverTypedDataSigner`.
- Pre-built message types: `PermitMessage`, `ApprovalMessage`, `TransferMessage`.
- Cross-language test vectors validated against the shared `tests/vectors.json` from the Rust crate.
