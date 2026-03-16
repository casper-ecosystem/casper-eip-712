import { describe, it, expect } from "vitest";
import { keccak256 } from "../src/keccak.js";
import { toHex } from "../src/utils.js";

describe("keccak256", () => {
  it("hashes empty input", () => {
    const hash = keccak256(new Uint8Array(0));
    expect(toHex(hash)).toBe(
      "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
    );
  });

  it("hashes 'hello'", () => {
    const hash = keccak256(new TextEncoder().encode("hello"));
    expect(toHex(hash)).toBe(
      "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"
    );
  });
});
