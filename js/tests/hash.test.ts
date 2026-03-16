import { describe, it, expect } from "vitest";
import { hashStruct, hashTypedData } from "../src/hash.js";
import { toHex } from "../src/utils.js";

const permitTypes = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

describe("hashStruct", () => {
  it("matches vectors.json permit_basic structHash", () => {
    const hash = hashStruct("Permit", permitTypes, {
      owner: "0x2222222222222222222222222222222222222222",
      spender: "0x3333333333333333333333333333333333333333",
      value: "0x4444444444444444444444444444444444444444444444444444444444444444",
      nonce: "0x5555555555555555555555555555555555555555555555555555555555555555",
      deadline: "0x6666666666666666666666666666666666666666666666666666666666666666",
    });
    expect(toHex(hash)).toBe(
      "0x2feca5389c256a1ed1a2562e50b5aa9eec5ae8008a2f365726ca552672a7a8f1"
    );
  });
});

describe("hashTypedData", () => {
  it("matches vectors.json permit_basic digest", () => {
    const domain = {
      name: "MyToken",
      version: "1",
      chainId: 1,
      verifyingContract: "0x1111111111111111111111111111111111111111",
    };
    const digest = hashTypedData(domain, permitTypes, "Permit", {
      owner: "0x2222222222222222222222222222222222222222",
      spender: "0x3333333333333333333333333333333333333333",
      value: "0x4444444444444444444444444444444444444444444444444444444444444444",
      nonce: "0x5555555555555555555555555555555555555555555555555555555555555555",
      deadline: "0x6666666666666666666666666666666666666666666666666666666666666666",
    });
    expect(toHex(digest)).toBe(
      "0x647e5fecd3e0bae728bc3dae848eb34ca05f7972aec3274ba0b9388b123d1ba2"
    );
  });

  it("produces 32-byte digest", () => {
    const domain = { name: "Test", version: "1" };
    const types = { Simple: [{ name: "value", type: "uint256" }] };
    const digest = hashTypedData(domain, types, "Simple", { value: 42n });
    expect(digest.length).toBe(32);
  });
});
