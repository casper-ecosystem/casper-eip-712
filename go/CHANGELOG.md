# Changelog — github.com/casper-ecosystem/casper-eip-712/go

All notable changes to the Go module are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Release tags follow the `go/v*.*.*` convention required by the Go module proxy
(e.g. `go/v1.2.0`).

## [1.2.1] - 2026-05-13

### Changed

- Adopt the [CAIP-2](https://github.com/ChainAgnostic/namespaces/blob/main/casper/caip2.md) format (`casper:<chainspec_name>`) as the recommended value for `chain_name` in Casper-native EIP-712 domain separators. Domain test vectors updated from `"casper-test"` / `"casper"` to `"casper:casper-test"` / `"casper:casper"`. Documented in `README.md` and `doc.go`.

## [1.2.0] - 2026-04-24

### Added

- Initial release of the Go module.
- Full EIP-712 encoding pipeline: `EncodeType`, `EncodeData`, `HashStruct`, `HashTypedData`.
- Domain separator hashing (`HashDomain`).
- Pre-built message types: `Permit`, `Approval`, `Transfer` (under `prebuilt/`).
- Cross-language test suite validated against the shared `tests/vectors.json`.
- GitHub Actions publish workflow (`publish-go.yaml`) creating `go/v*.*.*` tags from `rc-go-*.*.*` branches.
