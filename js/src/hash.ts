import type { EIP712Domain, TypeDefinitions, TypedDataOptions } from "./types.js";
import { keccak256 } from "./keccak.js";
import { encodeField } from "./encoding.js";
import { computeTypeHash } from "./type-hash.js";
import { hashDomainSeparator } from "./domain.js";
import { buildCanonicalTypeString } from "./type-string.js";

export function hashStruct(
  primaryType: string,
  types: TypeDefinitions,
  message: Record<string, unknown>,
): Uint8Array {
  const fields = types[primaryType];
  if (!fields) throw new Error(`Type "${primaryType}" not found in type definitions`);

  const typeString = buildCanonicalTypeString(primaryType, types);
  const typeHash = computeTypeHash(typeString);

  const parts: Uint8Array[] = [typeHash];
  for (const field of fields) {
    const value = message[field.name];
    parts.push(encodeField(field.type, value, types));
  }

  const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
  const encoded = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    encoded.set(part, offset);
    offset += part.length;
  }

  return keccak256(encoded);
}

export function hashTypedData(
  domain: EIP712Domain,
  types: TypeDefinitions,
  primaryType: string,
  message: Record<string, unknown>,
  options?: TypedDataOptions,
): Uint8Array {
  const domainHash = hashDomainSeparator(domain, options?.domainTypes);
  const structHash = hashStruct(primaryType, types, message);

  const data = new Uint8Array(66);
  data[0] = 0x19;
  data[1] = 0x01;
  data.set(domainHash, 2);
  data.set(structHash, 34);

  return keccak256(data);
}
