# casper-eip-712 × CSPRClick wallet integration

This guide shows how to request EIP-712 typed data signatures from the [CSPRClick](https://www.csprclick.com) browser wallet using `casper-eip-712`.

## Background

CSPRClick 2.x supports **secp256k1** key pairs and exposes a `signTypedData` method compatible with the [EIP-712](https://eips.ethereum.org/EIPS/eip-712) standard. The resulting signature can be verified on-chain by a Casper smart contract that uses the `casper-eip-712` Rust library.

## Setup

```bash
npm install @casper-ecosystem/casper-eip-712 @make-software/csprclick-tools
```

## Signing a Permit message

```typescript
import ClickUI, { CasperDash } from "@make-software/csprclick-tools";
import {
  PermitTypes,
  hashTypedData,
  recoverTypedDataSigner,
  toHex,
  type EIP712Domain,
  type PermitMessage,
} from "@casper-ecosystem/casper-eip-712";

// 1. Initialize CSPRClick
const clickOptions = {
  appName: "My dApp",
  contentElement: "#csprclick-ui",
  providers: [CasperDash],
};
const clickUI = new ClickUI(clickOptions);
await clickUI.init();

// 2. Connect wallet
await clickUI.connect();
const activeAccount = clickUI.getActiveAccount();
// activeAccount.public_key is a hex string (no 0x prefix) — 66 chars for secp256k1

// 3. Build domain and message
const domain: EIP712Domain = {
  name: "MyToken",
  version: "1",
  chainId: 1514,                          // Casper mainnet EVM chain ID
  verifyingContract: "0x<contract-addr>", // your on-chain contract address
};

const permit: PermitMessage = {
  owner: "0x" + activeAccount.public_key.slice(2), // drop secp256k1 prefix byte if present
  spender: "0x<spender-address>",
  value: `0x${(1000n * 10n ** 18n).toString(16).padStart(64, "0")}`,
  nonce: `0x${"0".repeat(64)}`,
  deadline: `0x${(Math.floor(Date.now() / 1000) + 3600).toString(16).padStart(64, "0")}`,
};

// 4. Compute the EIP-712 digest
const digest = hashTypedData(domain, PermitTypes, "Permit", permit);

// 5. Request signature from CSPRClick
// CSPRClick's signTypedData accepts the raw 32-byte digest as a hex string
const signResult = await clickUI.signTypedData(toHex(digest), activeAccount.public_key);
// signResult.signature is a hex string (no 0x prefix)

// 6. Verify locally (optional — the contract verifies on-chain)
const sigBytes = new Uint8Array(
  signResult.signature.match(/.{2}/g)!.map((b: string) => parseInt(b, 16))
);
const recovered = recoverTypedDataSigner(digest, sigBytes);
console.log("Recovered:", recovered);

// 7. Submit to your backend / smart contract
//    Pass: domain, types (PermitTypes), message, and signResult.signature
```

## Submitting the signed permit on-chain

Once you have the signature, relay it to the Casper contract's `permit()` entrypoint. See the [permit-token example](../permit-token/) for the full Rust contract implementation that accepts and verifies this signature.

The contract call pattern (using `casper-client` or the Casper JS SDK):

```
permit(
  owner: Key,
  spender: Key,
  value: U256,
  nonce: U256,
  deadline: U64,
  signature_bytes: Bytes,  // the 65-byte secp256k1 signature
  use_evm_domain: bool,    // true for EVM-compatible domain
)
```

## Notes

- CSPRClick uses **secp256k1** keys. The library's `recoverTypedDataSigner` returns an Ethereum-style hex address derived from the public key.
- The `verifyingContract` field in the domain must be the Casper contract's `contract_package_hash` encoded as a 32-byte EVM-style address (`0x` + 32 bytes hex).
- Chain IDs: `1514` = Casper mainnet, `1515` = Casper testnet.
- For Casper-native domain (non-EVM), replace the `chainId`/`verifyingContract` pair with `chain_name`/`contract_package_hash` and pass `CASPER_DOMAIN_TYPES` as the domain type definition.

## References

- [CSPRClick documentation](https://docs.csprclick.com)
- [casper-eip-712 JS API](../../js/README.md)
- [permit-token example contract](../permit-token/)
