# @casper-ecosystem/casper-eip-712

TypeScript companion package for the Rust `casper-eip-712` crate.

It provides EIP-712 typed data hashing plus ECDSA signature recovery for Casper-oriented flows, including support for Casper-specific domain fields when you supply explicit domain types.

## Install

```bash
npm install @casper-ecosystem/casper-eip-712
```

## Quick start

```ts
import {
  hashTypedData,
  recoverTypedDataSigner,
  verifySignature,
  PermitTypes,
  type PermitMessage,
} from "@casper-ecosystem/casper-eip-712";

const domain = {
  name: "My Token",
  version: "1",
  chainId: 1,
  verifyingContract: "0x1111111111111111111111111111111111111111",
};

const message: PermitMessage = {
  owner: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  spender: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  value: "0x01",
  nonce: "0x00",
  deadline: "0xffff",
};

const signature = new Uint8Array(65); // Illustrative placeholder only; use a real 65-byte signature in production.
const digest = hashTypedData(domain, PermitTypes, "Permit", message);
const signer = recoverTypedDataSigner(domain, PermitTypes, "Permit", message, signature);
const isValid = verifySignature(digest, signature, "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
```

## Casper-specific domains

If your domain uses Casper-specific fields such as `chain_name` or `contract_package_hash`, pass explicit `domainTypes` so the package knows the intended domain schema.

The `chain_name` field is recommended to be a [CAIP-2](https://github.com/ChainAgnostic/namespaces/blob/main/casper/caip2.md) chain id of the form `casper:<chainspec_name>` — for example `casper:casper` for mainnet and `casper:casper-test` for testnet.

```ts
import { hashTypedData } from "@casper-ecosystem/casper-eip-712";

const domain = {
  name: "CSPR",
  version: "1",
  chain_name: "casper:casper-test",
  contract_package_hash:
    "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
};

const digest = hashTypedData(domain, types, "Permit", message, {
  domainTypes: [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chain_name", type: "string" },
    { name: "contract_package_hash", type: "bytes32" },
  ],
});
```

## Building the canonical type string

When you need the EIP-712 canonical type string for a primary type use `buildCanonicalTypeString`. It resolves nested struct dependencies and appends them in alphabetical order, as required by the EIP-712 spec.

```ts
import { buildCanonicalTypeString, computeTypeHash } from "@casper-ecosystem/casper-eip-712";

const types = {
  Person: [
    { name: "name", type: "string" },
    { name: "wallet", type: "address" },
  ],
  Mail: [
    { name: "from", type: "Person" },
    { name: "to", type: "Person" },
    { name: "contents", type: "string" },
  ],
};

const typeString = buildCanonicalTypeString("Mail", types);
// "Mail(Person from,Person to,string contents)Person(string name,address wallet)"

const typeHash = computeTypeHash(typeString);
```

## Rust-mirroring convenience helpers

For callers that want the lower-level shape from the Rust crate, the package also exposes:

```ts
import {
  buildDomain,
  CASPER_DOMAIN_TYPES,
  computeTypeHash,
  encodeAddress,
  encodeUint256,
  hashTypedDataRaw,
} from "@casper-ecosystem/casper-eip-712";

const domain = buildDomain(
  "CasperToken",
  "1",
  "casper:casper-test",
  "0x7777777777777777777777777777777777777777777777777777777777777777",
);

const typeHash = computeTypeHash(
  "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)",
);

const encodedStruct = new Uint8Array(32 * 5);
encodedStruct.set(encodeAddress("0x2222222222222222222222222222222222222222"), 0);
encodedStruct.set(encodeAddress("0x3333333333333333333333333333333333333333"), 32);
encodedStruct.set(encodeUint256(1n), 64);
encodedStruct.set(encodeUint256(0n), 96);
encodedStruct.set(encodeUint256(999999n), 128);

const digest = hashTypedDataRaw(domain, typeHash, encodedStruct, {
  domainTypes: CASPER_DOMAIN_TYPES,
});
```

## API surface

- `buildDomain(name, version, chainName, contractPackageHash)`
- `hashDomainSeparator(domain, domainTypes?)`
- `hashStruct(primaryType, types, message)`
- `hashTypedData(domain, types, primaryType, message, options?)`
- `hashTypedDataRaw(domain, typeHash, encodedStruct, options?)`
- `buildCanonicalTypeString(primaryType, types)`
- `computeTypeHash(typeString)`
- `recoverAddress(digest, signature)`
- `recoverTypedDataSigner(domain, types, primaryType, message, signature, options?)`
- `verifySignature(digest, signature, expectedAddress)`
- Encoding helpers: `encodeAddress`, `encodeUint256`, `encodeUint64`, `encodeBytes32`, `encodeBytes`, `encodeString`, `encodeBool`, `encodeField`
- Domain helpers: `CASPER_DOMAIN_TYPES`, `buildDomainTypeString`
- Prebuilt message types: `PermitTypes`, `ApprovalTypes`, `TransferTypes`

## Development

```bash
npm test
npm run build
```

Cross-language parity is covered by test vectors in `../tests/vectors.json`.
