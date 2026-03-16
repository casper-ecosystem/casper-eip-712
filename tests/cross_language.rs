use casper_eip_712::prelude::*;
use hex::FromHex;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct VectorsFile {
    vectors: Vec<PermitVector>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PermitVector {
    name: String,
    primary_type: String,
    domain: DomainVector,
    message: PermitMessageVector,
    domain_separator: String,
    struct_hash: String,
    digest: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DomainVector {
    name: String,
    version: String,
    chain_id: u64,
    verifying_contract: String,
}

#[derive(Debug, Deserialize)]
struct PermitMessageVector {
    owner: String,
    spender: String,
    value: String,
    nonce: String,
    deadline: String,
}

fn parse_hex_array<const N: usize>(value: &str) -> [u8; N] {
    let trimmed = value.strip_prefix("0x").unwrap_or(value);
    let bytes = <Vec<u8>>::from_hex(trimmed).expect("valid hex input");
    let array: [u8; N] = bytes.try_into().expect("hex input has expected byte length");
    array
}

#[test]
fn permit_vectors_match_ethers_reference_values() {
    let vectors: VectorsFile = serde_json::from_str(include_str!("vectors.json")).expect("vectors.json parses");
    assert!(!vectors.vectors.is_empty(), "expected at least one cross-language vector");

    for vector in vectors.vectors {
        assert_eq!(vector.primary_type, "Permit", "unexpected primary type in {}", vector.name);

        let domain = DomainBuilder::new()
            .name(&vector.domain.name)
            .version(&vector.domain.version)
            .chain_id(vector.domain.chain_id)
            .verifying_contract(parse_hex_array::<20>(&vector.domain.verifying_contract))
            .build();

        let permit = Permit {
            owner: parse_hex_array::<20>(&vector.message.owner),
            spender: parse_hex_array::<20>(&vector.message.spender),
            value: parse_hex_array::<32>(&vector.message.value),
            nonce: parse_hex_array::<32>(&vector.message.nonce),
            deadline: parse_hex_array::<32>(&vector.message.deadline),
        };

        assert_eq!(
            domain.separator_hash(),
            parse_hex_array::<32>(&vector.domain_separator),
            "domain separator mismatch for {}",
            vector.name
        );
        assert_eq!(
            permit.hash_struct(),
            parse_hex_array::<32>(&vector.struct_hash),
            "struct hash mismatch for {}",
            vector.name
        );
        assert_eq!(
            hash_typed_data(&domain, &permit),
            parse_hex_array::<32>(&vector.digest),
            "typed data digest mismatch for {}",
            vector.name
        );
    }
}
