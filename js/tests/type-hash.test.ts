import { describe, it, expect } from "vitest";
import { computeTypeHash } from "../src/type-hash.js";
import { toHex } from "../src/utils.js";

describe("computeTypeHash", () => {
  it("computes Permit type hash matching EIP-712 reference", () => {
    const hash = computeTypeHash(
      "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    );
    expect(toHex(hash)).toBe(
      "0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9"
    );
  });

  it("computes EIP712Domain type hash matching reference", () => {
    const hash = computeTypeHash(
      "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    expect(toHex(hash)).toBe(
      "0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f"
    );
  });

  it("different type strings produce different hashes", () => {
    const h1 = computeTypeHash("Foo(uint256 a)");
    const h2 = computeTypeHash("Bar(uint256 a)");
    expect(toHex(h1)).not.toBe(toHex(h2));
  });
});
