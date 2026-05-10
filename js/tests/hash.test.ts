import { describe, it, expect } from "vitest";
import { hashStruct, hashTypedData, hashTypedDataRaw } from "../src/hash.js";
import { buildDomain, CASPER_DOMAIN_TYPES } from "../src/domain.js";
import { encodeAddress, encodeUint256 } from "../src/encoding.js";
import { computeTypeHash } from "../src/type-hash.js";
import { buildCanonicalTypeString } from "../src/type-string.js";
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

describe("nested struct support", () => {
  const nestedTypes = {
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

  const nestedMessage = {
    from: {
      name: "Alice",
      wallet: "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
    },
    to: {
      name: "Bob",
      wallet: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    },
    contents: "Hello, Bob!",
  };

  it("builds the canonical type string including referenced structs", () => {
    expect(buildCanonicalTypeString("Mail", nestedTypes)).toBe(
      "Mail(Person from,Person to,string contents)Person(string name,address wallet)"
    );
  });

  it("hashes nested structs using recursive struct encoding", () => {
    const hash = hashStruct("Mail", nestedTypes, nestedMessage);
    expect(toHex(hash)).toBe("0xa12982453ebbee5f1d3f6e31ee4ef3d4868d7def3f17d3aedcff283f3b58878e");
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

  it("hashTypedDataRaw matches the high-level API for Casper-native Permit data", () => {
    const domain = buildDomain(
      "CasperToken",
      "1",
      "casper:casper-test",
      "0x7777777777777777777777777777777777777777777777777777777777777777",
    );

    const encodedStruct = new Uint8Array(32 * 5);
    encodedStruct.set(encodeAddress("0x2222222222222222222222222222222222222222"), 0);
    encodedStruct.set(encodeAddress("0x3333333333333333333333333333333333333333"), 32);
    encodedStruct.set(
      encodeUint256("0x4444444444444444444444444444444444444444444444444444444444444444"),
      64,
    );
    encodedStruct.set(
      encodeUint256("0x5555555555555555555555555555555555555555555555555555555555555555"),
      96,
    );
    encodedStruct.set(
      encodeUint256("0x6666666666666666666666666666666666666666666666666666666666666666"),
      128,
    );

    const typeHash = computeTypeHash(
      "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)",
    );

    const rawDigest = hashTypedDataRaw(domain, typeHash, encodedStruct, {
      domainTypes: CASPER_DOMAIN_TYPES,
    });

    const genericDigest = hashTypedData(
      domain,
      permitTypes,
      "Permit",
      {
        owner: "0x2222222222222222222222222222222222222222",
        spender: "0x3333333333333333333333333333333333333333",
        value: "0x4444444444444444444444444444444444444444444444444444444444444444",
        nonce: "0x5555555555555555555555555555555555555555555555555555555555555555",
        deadline: "0x6666666666666666666666666666666666666666666666666666666666666666",
      },
      { domainTypes: CASPER_DOMAIN_TYPES },
    );

    expect(toHex(rawDigest)).toBe(toHex(genericDigest));
  });
});
