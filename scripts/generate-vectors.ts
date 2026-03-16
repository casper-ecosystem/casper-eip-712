import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TypedDataEncoder } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.join(__dirname, "..");

const domain = {
  name: "MyToken",
  version: "1",
  chainId: 1,
  verifyingContract: "0x1111111111111111111111111111111111111111",
};

const types = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

const message = {
  owner: "0x2222222222222222222222222222222222222222",
  spender: "0x3333333333333333333333333333333333333333",
  value: "0x4444444444444444444444444444444444444444444444444444444444444444",
  nonce: "0x5555555555555555555555555555555555555555555555555555555555555555",
  deadline: "0x6666666666666666666666666666666666666666666666666666666666666666",
};

const vectors = {
  generatedBy: "ethers.TypedDataEncoder.hash",
  generatedAt: new Date().toISOString(),
  vectors: [
    {
      name: "permit_basic",
      primaryType: "Permit",
      domain,
      message,
      domainSeparator: TypedDataEncoder.hashDomain(domain),
      structHash: TypedDataEncoder.from(types).hash(message),
      digest: TypedDataEncoder.hash(domain, types, message),
    },
  ],
};

const outputPath = path.join(repoRoot, "tests", "vectors.json");
mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(vectors, null, 2)}\n`);
console.log(`wrote ${outputPath}`);
