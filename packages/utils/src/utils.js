import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "@ceramicnetwork/key-did-resolver";
import { getResolver } from "web-did-resolver";

import { ec as EC } from "elliptic";
import { randomString, randomBytes } from "@stablelib/random";

const didJWT = require("did-jwt");

const ec = new EC("secp256k1");

/// ///////////////////
// Client-side
/// ///////////////////
export const createDid = async (seed) => {
  if (!seed) throw Error("No seed provided");
  const provider = new Ed25519Provider(seed);

  // v1.0.0 method key-did-provider-ed25519.
  // v1.1.0 dids
  // Fails with "DID is not authenticated" after did.authenticate()
  const did = new DID({ provider, resolver: KeyResolver.getResolver() });

  await did.authenticate();
  return did;
};

export const signDid = async (did, content) => {
  return did.createJWS(content);
};

export const verifyJWT = async (jwt, serviceDid) => {
  const decoded = didJWT.decodeJWT(jwt);
  const resolveWeb = getResolver().web;
  const mockResolver = () => {
    return serviceDid;
  };
  // console.log(await resolveWeb("did:web:localhost:3000"));
  return await didJWT.verifyJWT(jwt, {
    // resolver: { resolve: resolveWeb },
    resolver: { resolve: mockResolver },
    // audience: did,
    // audience: "did:web:verifications.3box.io",
  });
};

/// ///////////////////
// Server-side
/// ///////////////////
export const createRandomSecp256k1 = async () => {
  const seed = randomString(32);
  const publicKey = ec.keyFromPrivate(seed).getPublic(true, "hex");
  // const bytes = new Uint8Array(pubBytes.length + 2)
  // bytes[0] = 0xe7 // secp256k1 multicodec
  // bytes[1] = 0x01
  // bytes.set(pubBytes, 2)
  return { publicKey, privateKey: seed };
};

export const verifyJWS = async (jws) => {
  const did = new DID({
    resolver: KeyResolver.getResolver(),
  });
  const { kid, payload } = await did.verifyJWS(jws);
  return { kid, payload, id: kid.split("#")[0] };
};

export const issueGithubClaim = async (
  did,
  username,
  verification_url,
  privateKey
) => {
  const signer = didJWT.SimpleSigner(privateKey);
  return didJWT
    .createJWT(
      {
        sub: did,
        nbf: Math.floor(Date.now() / 1000),
        vc: {
          "@context": ["https://www.w3.org/2018/credentials/v1"],
          type: ["VerifiableCredential"],
          credentialSubject: {
            account: {
              type: "Github",
              username,
              url: verification_url,
            },
          },
        },
      },
      {
        issuer: "did:web:localhost:3000",
        signer,
      }
    )
    .then((jwt) => {
      return jwt;
    })
    .catch((err) => {
      console.log(err);
    });
};
