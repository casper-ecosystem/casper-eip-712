/**
 * EIP-712 typed data signing with viem + casper-eip-712
 *
 * Demonstrates how to sign a Permit message using a viem wallet client
 * and verify the resulting signature with casper-eip-712.
 *
 * Run: npx tsx demo.ts
 */

import { createWalletClient, http, hashTypedData as viemHashTypedData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import {
  PermitTypes,
  hashTypedData,
  recoverAddress,
  toHex,
  type EIP712Domain,
  type PermitMessage,
} from "@casper-ecosystem/casper-eip-712";

// ── Setup ────────────────────────────────────────────────────────────────────

// Deterministic test key — never use this in production
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const account = privateKeyToAccount(PRIVATE_KEY);

console.log("═══════════════════════════════════════════════════════════");
console.log(" casper-eip-712 × viem signing demo");
console.log("═══════════════════════════════════════════════════════════\n");
console.log(`Account: ${account.address}\n`);

// ── Domain ───────────────────────────────────────────────────────────────────

// The Casper EVM-compatible domain uses the Casper EVM chainId.
// For Casper mainnet: 1514 | For Casper testnet: 1515
const domain: EIP712Domain = {
  name: "MyToken",
  version: "1",
  chainId: 1514,
  verifyingContract: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
};

// ── Message ──────────────────────────────────────────────────────────────────

const spender = "0xcccccccccccccccccccccccccccccccccccccccc";
const permitMessage: PermitMessage = {
  owner: account.address,
  spender,
  value: `0x${(1000n * 10n ** 18n).toString(16).padStart(64, "0")}`,
  nonce: `0x${"0".repeat(64)}`,
  deadline: `0x${(Math.floor(Date.now() / 1000) + 3600).toString(16).padStart(64, "0")}`,
};

// ── Sign with viem ────────────────────────────────────────────────────────────

// viem's signTypedData expects BigInt values for uint256 fields
const viemPermit = {
  owner: account.address as `0x${string}`,
  spender: spender as `0x${string}`,
  value: 1000n * 10n ** 18n,
  nonce: 0n,
  deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
};

const client = createWalletClient({ account, chain: mainnet, transport: http() });

// viem's signTypedData produces an EIP-712 signature
const signature = await client.signTypedData({
  account,
  domain: {
    name: domain.name,
    version: domain.version,
    chainId: domain.chainId,
    verifyingContract: domain.verifyingContract as `0x${string}`,
  },
  types: {
    // viem expects EIP-712 types as Record<string, {name, type}[]>
    Permit: PermitTypes.Permit.map((f) => ({ name: f.name, type: f.type })),
  },
  primaryType: "Permit",
  message: viemPermit,
});

console.log("Signed with viem signTypedData()");
console.log(`  Signature: ${signature.slice(0, 42)}...`);
console.log(`  Length:    ${(signature.length - 2) / 2} bytes\n`);

// ── Verify with casper-eip-712 ───────────────────────────────────────────────

const sigBytes = new Uint8Array(
  signature.slice(2).match(/.{2}/g)!.map((b) => parseInt(b, 16))
);

const digest = hashTypedData(domain, PermitTypes, "Permit", permitMessage);
// recoverAddress returns a 20-byte Uint8Array (raw address)
const recoveredBytes = recoverAddress(digest, sigBytes);
const recovered = toHex(recoveredBytes);

console.log("Verification with casper-eip-712:");
console.log(`  Digest:    ${toHex(digest)}`);
console.log(`  Expected:  ${account.address.toLowerCase()}`);
console.log(`  Recovered: ${recovered.toLowerCase()}`);
console.log(`  Match:     ${recovered.toLowerCase() === account.address.toLowerCase() ? "✓ YES" : "✗ NO"}\n`);

// ── Cross-check: viem hash vs casper-eip-712 hash ────────────────────────────

// Both libraries must produce the same EIP-712 digest for the same input.
const viemDigest = viemHashTypedData({
  domain: {
    name: domain.name,
    version: domain.version,
    chainId: domain.chainId,
    verifyingContract: domain.verifyingContract as `0x${string}`,
  },
  types: {
    Permit: PermitTypes.Permit.map((f) => ({ name: f.name, type: f.type })),
  },
  primaryType: "Permit",
  message: viemPermit,
});

console.log("Digest parity check (viem vs casper-eip-712):");
console.log(`  viem:            ${viemDigest}`);
console.log(`  casper-eip-712:  ${toHex(digest)}`);
console.log(`  Match:           ${viemDigest === toHex(digest) ? "✓ YES" : "✗ NO"}\n`);
