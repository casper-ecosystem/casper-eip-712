import { keccak_256 } from "@noble/hashes/sha3";

/**
 * Compute keccak256 hash of input data.
 */
export function keccak256(data: Uint8Array): Uint8Array {
  return keccak_256(data);
}
