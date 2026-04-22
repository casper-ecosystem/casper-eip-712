# casper-eip-712 × viem signing example

Demonstrates how to sign EIP-712 typed data using [viem](https://viem.sh) and verify the result with `casper-eip-712`. The same signature would be accepted by a Casper smart contract using the library's Rust implementation.

## Run

```bash
npm install
npx tsx demo.ts
```

## What it shows

1. **Sign with viem** — `signTypedData()` on a `WalletClient` produces an EIP-712 signature.
2. **Verify with casper-eip-712** — `recoverTypedDataSigner()` recovers the signer from the digest and signature bytes.
3. **Digest parity** — `viemHashTypedData()` and `casper-eip-712`'s `hashTypedData()` produce identical digests for the same input, confirming wire compatibility.

## Key points

- `PermitTypes` from `casper-eip-712` maps directly to viem's type format — just spread `{name, type}` from each field array.
- The Casper EVM chain IDs are **1514** (mainnet) and **1515** (testnet).
- `value`, `nonce`, and `deadline` are `uint256` — pass as `bigint` to viem, as 32-byte hex strings to `casper-eip-712`.

## Integration in your dapp

```typescript
import { createWalletClient, custom } from "viem";
import { PermitTypes } from "@casper-ecosystem/casper-eip-712";

// Use window.ethereum (MetaMask, CSPRClick in EVM mode, etc.)
const client = createWalletClient({ transport: custom(window.ethereum) });
const [address] = await client.requestAddresses();

const signature = await client.signTypedData({
  account: address,
  domain: { name: "MyToken", version: "1", chainId: 1514, verifyingContract: "0x..." },
  types: { Permit: PermitTypes.Permit.map((f) => ({ name: f.name, type: f.type })) },
  primaryType: "Permit",
  message: { owner: address, spender: "0x...", value: 1000n, nonce: 0n, deadline: deadlineBigInt },
});
```
