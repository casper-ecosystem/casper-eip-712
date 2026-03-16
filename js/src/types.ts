/**
 * EIP-712 domain object. Standard fields are auto-inferred;
 * custom Casper fields require explicit domainTypes.
 */
export interface EIP712Domain {
  name?: string;
  version?: string;
  chainId?: number | bigint;
  verifyingContract?: string;
  salt?: string;
  [key: string]: unknown;
}

/** A single field in a type definition. */
export interface TypedField {
  name: string;
  type: string;
}

/** Map of type name → array of fields. */
export type TypeDefinitions = Record<string, TypedField[]>;

/** Options for functions that accept custom domain types. */
export interface TypedDataOptions {
  domainTypes?: TypedField[];
}
