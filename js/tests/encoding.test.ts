import { describe, it, expect } from "vitest";
import {
  encodeAddress,
  encodeUint256,
  encodeUint64,
  encodeString,
  encodeBytes32,
  encodeBytes,
  encodeBool,
} from "../src/encoding.js";
import { toHex } from "../src/utils.js";
import { keccak256 } from "../src/keccak.js";

describe("encoding", () => {
  describe("encodeAddress", () => {
    it("left-pads 20-byte address to 32 bytes", () => {
      const encoded = encodeAddress("0x1111111111111111111111111111111111111111");
      expect(encoded.length).toBe(32);
      expect(toHex(encoded.slice(0, 12))).toBe("0x000000000000000000000000");
      expect(toHex(encoded.slice(12))).toBe("0x1111111111111111111111111111111111111111");
    });

    it("handles zero address", () => {
      const encoded = encodeAddress("0x0000000000000000000000000000000000000000");
      expect(encoded).toEqual(new Uint8Array(32));
    });
  });

  describe("encodeUint256", () => {
    it("encodes bigint as 32-byte big-endian", () => {
      const encoded = encodeUint256(1n);
      expect(encoded.length).toBe(32);
      expect(encoded[31]).toBe(1);
      expect(encoded[0]).toBe(0);
    });

    it("encodes hex string", () => {
      const encoded = encodeUint256("0x0000000000000000000000000000000000000000000000000000000000001234");
      expect(encoded.length).toBe(32);
      expect(encoded[30]).toBe(0x12);
      expect(encoded[31]).toBe(0x34);
    });

    it("encodes max uint256", () => {
      const max = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
      const encoded = encodeUint256(max);
      expect(encoded.every((b) => b === 0xff)).toBe(true);
    });
  });

  describe("encodeString", () => {
    it("returns keccak256 of UTF-8 bytes", () => {
      const encoded = encodeString("hello");
      const expected = keccak256(new TextEncoder().encode("hello"));
      expect(toHex(encoded)).toBe(toHex(expected));
    });
  });

  describe("encodeBytes32", () => {
    it("passes through 32 bytes", () => {
      const hex = "0x" + "ab".repeat(32);
      const encoded = encodeBytes32(hex);
      expect(encoded.length).toBe(32);
      expect(encoded.every((b) => b === 0xab)).toBe(true);
    });
  });

  describe("encodeBytes", () => {
    it("returns keccak256 of raw bytes", () => {
      const data = new Uint8Array([1, 2, 3]);
      const encoded = encodeBytes(data);
      expect(toHex(encoded)).toBe(toHex(keccak256(data)));
    });
  });

  describe("encodeBool", () => {
    it("encodes true as 1 in last byte", () => {
      const encoded = encodeBool(true);
      expect(encoded[31]).toBe(1);
      expect(encoded.slice(0, 31).every((b) => b === 0)).toBe(true);
    });

    it("encodes false as all zeros", () => {
      const encoded = encodeBool(false);
      expect(encoded.every((b) => b === 0)).toBe(true);
    });
  });
});
