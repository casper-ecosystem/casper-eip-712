---
title: Why We Brought Ethereum's Most Important Signing Standard to Casper
published: false
description: Security-driven infrastructure for gasless UX, cross-chain bridges, and agentic commerce on Casper
tags: blockchain, rust, typescript, webdev
cover_image:
canonical_url: https://medium.com/@mssteuer/replace-with-published-medium-url
---

# Why We Brought Ethereum's Most Important Signing Standard to Casper

*By Michael Steuer*

Every blockchain ecosystem says it wants better UX, easier onboarding, stronger security, and real cross-chain interoperability. Fair enough. But once you strip away the marketing varnish and look at the plumbing, a lot of those ambitions live or die on something far less glamorous: how users sign things.

If your chain wants gasless transactions, relayers, agentic commerce, cross-chain attestations, batch approvals, or even just sane wallet interactions, you eventually run into the same hard truth: opaque byte blobs and hand-rolled signature schemes are a terrible foundation for all of the above.

Ethereum figured this out years ago with EIP-712.

EIP-712 turned “sign this weird hash and trust me bro” into a typed, structured, domain-separated standard that wallets understand, contracts can verify, and security reviewers can reason about without developing a twitch. It became the foundation for permits, approvals, meta-transactions, marketplace orders, and a good chunk of what people now think of as normal Web3 behavior.

Casper needed that same foundation.

So now it has it.

We just open-sourced [`casper-eip-712`](https://github.com/casper-ecosystem/casper-eip-712), a Rust crate and TypeScript companion package that bring EIP-712 style typed-data hashing, domain separation, and signer recovery to Casper smart contracts and frontends.

And no, this did not start as a nice-to-have roadmap bullet or as one of those “wouldn’t it be cool if…” architecture brainstorms people put on slides and then forget about. It started the way a lot of the best infrastructure work starts: with a security auditor telling us we had a gap.

That tends to focus the mind.

## Why roll-your-own signatures fail

There are a few categories of problems in crypto that are almost guaranteed to end badly if every project invents its own answer. Signature encoding is one of them.

The moment you leave the world of a single, isolated contract and step into bridges, multi-chain deployments, relayers, or off-chain authorizations, signatures stop being a mere cryptographic detail and start becoming part of your application security model. What exactly got signed? For which deployment? On which chain? For which contract? For which version of the protocol? Can the exact same signature be replayed somewhere else? Can a wallet show the user something intelligible before they sign it? Can another tool reproduce and verify the digest without reverse-engineering your byte packing?

If the answer to those questions is “well, we concatenate some fields and keccak it,” you may already be in trouble.

The failure modes are not theoretical. Without proper domain separation, a signature intended for one deployment can become valid somewhere else. Without a standard typed schema, every integration has to rediscover how a message was encoded. Without clear wallet semantics, users sign opaque garbage and hope the application is being honest. That is not exactly the future of mainstream finance, commerce, or agent-driven systems.

We ran into this head-on while hardening the Casper↔EVM bridge. Audit work surfaced exactly the kind of issue category you never want to hand-wave away: signatures and attestations needed stronger, standardized binding to the intended deployment context. Not “this would be cleaner.” Not “this might be elegant.” More like: this needs to be made robust.

Security auditors don’t tell you what’s nice to have. They tell you what will get you exploited.

At that point, you have two choices. Patch the immediate issue in the narrowest possible way and move on. Or solve the actual class of problem once, properly, and turn the result into infrastructure the whole ecosystem can use.

We chose the second option.

## What EIP-712 is, and why Ethereum got this right

EIP-712 is Ethereum’s standard for hashing and signing typed structured data. That sounds dry, but it solved a very practical problem.

Before EIP-712, users were often asked to sign opaque bytestrings or hashes. Wallets could not meaningfully explain what was being signed. Developers had to invent custom encoding formats. Auditors had to reconstruct intent from byte-level gymnastics. And every off-chain authorization flow had a slightly different flavor of “please trust that this blob means what we say it means.”

EIP-712 cleaned this up by introducing three things that matter enormously.

First, it makes messages structured. Instead of signing a mystery blob, a user signs a message with named fields and explicit types. Think `Permit(owner, spender, value, nonce, deadline)` rather than 160 bytes of inscrutable soup.

Second, it makes messages domain-separated. The payload is bound to a domain that can include things like protocol name, version, chain ID, and verifying contract. That means a signature is not merely “a valid signature of this message,” but “a valid signature of this message for this specific application context.” That distinction is the difference between interoperability and replay bait.

Third, it makes the whole thing both human- and machine-readable. Wallets can present meaningful information before a user signs. Contracts can deterministically reconstruct the digest. Tooling can reproduce the exact same hash across languages. Auditors can reason about the system without needing to decode a one-off format invented at 2 a.m. on a deadline.

Ethereum adopted EIP-712 because it enabled real product behavior, not because standards people enjoy writing standards. ERC-2612 permits, gasless approvals, marketplace orders, relayer flows, delegated actions, batched authorizations — a lot of that rests on EIP-712 style signing. If you have used Uniswap, Aave, OpenSea, or any modern EVM wallet flow that signs a structured authorization instead of sending a transaction, you have already benefited from it.

If you’ve built on Ethereum, you’ve used this.

If you’re building on Casper, you’re about to.

And frankly, that matters well beyond developer convenience. Standards like EIP-712 become ecosystem accelerants. They compress integration effort. They reduce security variance between projects. They let wallets and tooling converge on shared behavior. That is how you go from one-off dApps to an actual platform.

## How we brought it to Casper

The result of that work is [`casper-eip-712`](https://crates.io/crates/casper-eip-712), a `no_std`-compatible Rust crate for typed-data hashing and domain separation on Casper, plus a TypeScript package for frontend and client-side signing flows.

At the Rust layer, the crate gives Casper developers the same building blocks EVM developers already expect: domain construction, typed-struct hashing, encoding helpers, prebuilt message types like `Permit`, and an optional verification feature for Ethereum-style secp256k1 signer recovery.

The simplest place to start is the domain itself.

```rust
use casper_eip_712::prelude::*;

let domain = DomainBuilder::new()
    .name("MyToken")
    .version("1")
    .chain_id(1)
    .verifying_contract([0x11; 20])
    .build();
```

That gives you a standard EVM-style EIP-712 domain with the usual fields developers already know: protocol name, version, chain ID, and verifying contract.

But we did not stop there, because Casper should not have to pretend it is Ethereum to benefit from Ethereum’s best standards.

We extended the same builder so it can also represent Casper-native deployment context.

```rust
use casper_eip_712::prelude::*;

let domain = DomainBuilder::new()
    .name("Bridge")
    .version("1")
    .custom_field("chain_name", DomainFieldValue::String("casper-test".into()))
    .custom_field("contract_package_hash", DomainFieldValue::Bytes32([0x99; 32]))
    .build();
```

That matters because real-world Casper deployments often want to bind signatures to `chain_name` and `contract_package_hash`, not force-fit everything into EVM address conventions. In other words: same standard, adapted intelligently to Casper’s reality.

From there, developers implement `Eip712Struct` for whatever message their contract needs to verify.

```rust
use alloc::vec::Vec;
use casper_eip_712::prelude::*;

struct Attestation {
    subject: [u8; 20],
    claim_hash: [u8; 32],
}

impl Eip712Struct for Attestation {
    fn type_string() -> &'static str {
        "Attestation(address subject,bytes32 claim_hash)"
    }

    fn type_hash() -> [u8; 32] {
        keccak256(Self::type_string().as_bytes())
    }

    fn encode_data(&self) -> Vec<u8> {
        let mut out = Vec::with_capacity(64);
        out.extend_from_slice(&encode_address(self.subject));
        out.extend_from_slice(&encode_bytes32(self.claim_hash));
        out
    }
}
```

And once you have a domain and a typed struct, the core operation is exactly what it should be:

```rust
let digest = hash_typed_data(&domain, &attestation);
```

That digest is stable, reproducible, and ready for signer recovery or contract verification.

A few design choices here were deliberate.

First, the crate is `no_std` with `alloc`, because smart contract environments are not exactly known for their luxury amenities. If a library meant for contract verification drags in assumptions that only make sense in a full-fat runtime, it is already failing the assignment.

Second, signer recovery is behind an optional `verify` feature. Some consumers only need hashing and domain separation. Others want full Ethereum-style secp256k1 verification on Casper. They can opt in to that without forcing every use case to carry extra baggage.

Third, we built `casper-eip-712` as a standalone Rust crate, not an Odra module. This was intentional: any Casper contract can use it, regardless of framework. But since many contracts on Casper are built with [Odra](https://odra.dev/docs/), the rapid-development smart contract framework for Casper, we made sure it integrates cleanly there as well. Add it to your `Cargo.toml`, import the prelude, and you are in business.

That is the whole point: make the secure path the convenient path.

## Real-world usage: the bridge

The bridge is where this stopped being abstract.

Before this work, the Casper side of the bridge used a set of hand-built cryptographic helpers and packed-byte hashing functions for various attestations: lock attestations, burn attestations, block header attestations, and more. It worked, in the same sense that a lot of custom crypto-adjacent plumbing “works” right up until somebody asks harder questions about replay domains, deployment specificity, auditability, wallet compatibility, and long-term maintainability.

You can absolutely build secure systems with careful manual hashing. People do it all the time. You can also hand-assemble your own gearbox if you really feel like spending your weekends that way. But the bridge work made something obvious: the ecosystem needed a standardized typed-data layer rather than an expanding collection of protocol-specific byte-packing recipes.

So the bridge became the first real beneficiary.

The Casper↔EVM bridge now has a path to verify domain-separated attestations using a standard that EVM tooling already understands, while still preserving Casper-native deployment context where needed. That gives us better security posture, easier reviewability, and a cleaner foundation for future cross-chain flows.

More importantly, we did not just patch a bridge-specific issue and move on.

We built infrastructure so that every project on Casper gets this right by default.

That is a much better use of time than fixing the same class of bug one protocol at a time.

## The TypeScript companion: because frontend developers deserve nice things too

Backend and contract-side correctness is only half the story. If developers cannot produce the exact same typed-data digest from a frontend or client app, the whole exercise gets a lot less useful.

That is why the project ships with the TypeScript companion package [`@casper-ecosystem/casper-eip-712`](https://www.npmjs.com/package/@casper-ecosystem/casper-eip-712).

It mirrors the Rust-side concepts closely enough that frontend teams do not have to invent an interpretive dance to make their signatures match on-chain verification. You can hash typed data, recover signers, verify signatures, and work with Casper-specific domain types from ordinary TypeScript code.

A minimal example looks like this:

```ts
import {
  hashTypedData,
  recoverTypedDataSigner,
  PermitTypes,
  type PermitMessage,
} from "@casper-ecosystem/casper-eip-712";

const domain = {
  name: "My Token",
  version: "1",
  chainId: 1,
  verifyingContract: "0x1111111111111111111111111111111111111111",
};

const message: PermitMessage = {
  owner: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  spender: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  value: "0x01",
  nonce: "0x00",
  deadline: "0xffff",
};

const digest = hashTypedData(domain, PermitTypes, "Permit", message);
const signer = recoverTypedDataSigner(domain, PermitTypes, "Permit", message, signature);
```

Frontend developers do not need to touch Rust. They just need to produce valid typed data that Casper contracts can verify. That is exactly what this package is for.

And yes, it supports Casper-native domains too, by passing explicit domain types such as `chain_name` and `contract_package_hash`. Again: same standard, adapted to Casper without sacrificing compatibility.

## Demo time: a permit/approve flow you can run right now

Standards are nice. Working examples are nicer.

The repository includes a full `permit-token` example that demonstrates a gasless `permit()` / approve pattern on Casper using a CEP-18 token. The demo contract is built with Odra, which is an important proof point by itself: the EIP-712 permit pattern drops into an Odra-based Casper contract as a regular crate dependency. No special adapters. No exotic glue code. No ritual sacrifice to the build gods.

The flow is simple and familiar to anyone who has used ERC-2612 style permits on Ethereum:

1. the token owner signs a `Permit` message off-chain,
2. a relayer or backend submits that signed authorization,
3. the Casper contract reconstructs the EIP-712 digest,
4. it recovers the signer and checks nonce and deadline,
5. it installs the allowance,
6. the spender later consumes that allowance via `transfer_from()`.

In the example contract, Odra's `Cep18` module handles the token behavior while `casper-eip-712` handles the typed-data digest and signer recovery. That division of labor is exactly what you want: keep the token logic where it belongs, and make typed authorization a reusable layer rather than a bespoke detour through custom crypto plumbing.

In other words: the owner authorizes, but does not need to pay gas or submit the transaction.

The TypeScript demo in the repository even shows the exact flavor we wanted to enable:
- generate an `ethers` wallet,
- build EIP-712 domains,
- sign with `wallet.signTypedData(...)`,
- verify locally with `@casper-ecosystem/casper-eip-712`,
- hand the same signature shape to the Casper contract.

You can run it yourself right now:

```bash
cd js && npm install && npm run build && cd ..
cd examples/permit-token/demo
npm install
npx tsx demo.ts
```

And if you want the Odra-side tests:

```bash
cd examples/permit-token
cargo odra test
```

You do not need to spin up a Casper node just to understand the flow. You can run this locally, inspect the digest construction, look at the recovered signer, and see how the same 65-byte signature moves from EVM-style tooling into Casper-side verification.

Run this without a Casper node. Right now. Go.

## What this unlocks for Casper

Now for the bigger picture.

It would be easy to look at `casper-eip-712` and say, “nice utility library.” That would also miss the point.

This is not just a library. It is a building block.

The most immediate unlock is gasless UX. Users can authorize actions off-chain while relayers or application operators submit the actual deploy. That means onboarding flows where a user does not first have to acquire CSPR just to click the first meaningful button. If you have spent any time thinking about why mainstream onboarding in crypto still feels like a hazing ritual, you know how important that is.

It also unlocks meta-transactions and batch authorization flows. A relayer can collect multiple permits or approvals and submit them efficiently. A dApp operator can subsidize transaction costs for users when it makes business sense. Wallet flows get cleaner. Product funnels get less hostile.

Then there is cross-chain interoperability, which is where this started. Typed, domain-separated attestations are precisely what you want when signatures need to survive contact with multiple deployments, multiple chains, and multiple verification environments without becoming replay bait. Casper contracts can now verify a standard that EVM ecosystems already understand, while still extending the domain model with Casper-native identifiers like `chain_name` and `contract_package_hash`.

And then we get to the part I think becomes increasingly important over the next couple of years: agentic commerce.

The crate README references [x402](https://www.x402.org/), and that is not accidental. If AI agents are going to buy services, authorize payments, initiate scoped transactions, or participate in machine-to-machine commerce, they cannot do that safely by signing mystery blobs. They need structured, auditable, domain-separated authorizations that humans can inspect, systems can verify, and contracts can enforce. EIP-712 is a natural fit for that world.

Same goes for non-crypto-native users. The more of the blockchain ceremony we can move behind clean off-chain authorization and relayer-assisted execution, the closer we get to products where users do not need to understand gas, nonce management, or why they are juggling three browser extensions and an anxiety disorder just to use an app.

That is where this becomes strategically important.

The next wave of adoption will not come from making the current crypto-native experience 7% less annoying. It will come from making blockchain disappear into better product design. Gasless interactions, delegated actions, interoperable standards, safer cross-chain flows, agent-friendly authorization models — those are not edge features. They are table stakes for the next era.

`casper-eip-712` helps position Casper for exactly that world.

## Build with us

If you are building on Casper, use it.

If you are building bridge infrastructure, relayer systems, permit flows, wallet integrations, or anything involving structured off-chain authorization, definitely use it.

If you are building on Ethereum and wondering what else is out there, try it. The signatures are the same.

- GitHub: <https://github.com/casper-ecosystem/casper-eip-712>
- Rust crate: <https://crates.io/crates/casper-eip-712>
- Rust docs: <https://docs.rs/casper-eip-712/1.0.0/casper_eip_712/>
- TypeScript package: <https://www.npmjs.com/package/@casper-ecosystem/casper-eip-712>
- Permit token example: <https://github.com/casper-ecosystem/casper-eip-712/tree/master/examples/permit-token>

Standards matter. Security matters. Interoperability matters.

And Casper speaking EVM standards is not some compromise of identity. It is how serious ecosystems make themselves easier to build on, easier to integrate with, and harder to get wrong.

That is the game.
