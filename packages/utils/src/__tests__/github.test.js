import { getResolver } from "web-did-resolver";

import { randomString, randomBytes } from "@stablelib/random";
import fetch from "node-fetch";

const didJWT = require("did-jwt");

const { createDid, signDid, verifyJWS } = require("../utils");

let did = null;
let challengeCode = null;
let jwt = null;
let serviceDid = null;

// const API_ENDPOINT =
//   "https://r27sfer037.execute-api.us-west-2.amazonaws.com/develop";
const API_ENDPOINT = "http://localhost:3000";
const USERNAME = "pi0neerpat";
const DID_SEED = [
  209,
  125,
  91,
  58,
  165,
  168,
  236,
  64,
  91,
  223,
  99,
  76,
  213,
  106,
  3,
  208,
  223,
  127,
  41,
  192,
  216,
  120,
  141,
  137,
  103,
  129,
  226,
  208,
  179,
  68,
  30,
  7,
];

describe("API", () => {
  beforeAll(() => {});

  test("getWellKnownDid", async (done) => {
    const res = await fetch(`${API_ENDPOINT}/.well-known/did.json`);
    serviceDid = await res.json();
    console.log(`Service public key:\n${serviceDid.publicKey[0].publicKeyHex}`);
    done();
  });

  test("createDid", (done) => {
    // const seed = randomBytes(32);
    createDid(DID_SEED).then((res) => {
      did = res;
      expect(/did:key:[a-zA-Z0-9]{48}/.test(did.id)).toBe(true);
      console.log(`User did:\n${did.id}`);
      done();
    });
  });

  test("/api/v0/request-github", async (done) => {
    const res = await fetch(`${API_ENDPOINT}/api/v0/request-github`, {
      method: "POST",
      body: JSON.stringify({
        username: USERNAME,
        did: did.id,
      }),
    });
    const data = await res.json();
    challengeCode = data.data.challengeCode;
    console.log(`Challenge code:\n${challengeCode}`);
    expect(challengeCode).not.toBeNull();
    done();
  });

  test("/api/v0/confirm-github", async (done) => {
    const jws = await signDid(did, { challengeCode });

    // Await 1s for the challengeCode to update in the db
    await new Promise((res) => setTimeout(res, 1000));

    const res = await fetch(`${API_ENDPOINT}/api/v0/confirm-github`, {
      method: "POST",
      body: JSON.stringify({
        jws,
      }),
    });
    const data = await res.json();
    console.log(data);
    expect(data.data).not.toBeUndefined();
    ({ attestation: jwt } = data.data);
    expect(jwt).not.toBeUndefined();
    expect(data.status).toBe("success");
    console.log(`confirm-github jwt:\n${jwt}`);
    done();
  });

  test("verifyCredential", async (done) => {
    const resolveWeb = getResolver().web;
    const mockResolver = (data) => {
      return serviceDid;
    };
    const verifiedResponse = await didJWT.verifyJWT(jwt, {
      // resolver: { resolve: resolveWeb },
      resolver: { resolve: mockResolver },
    });
    console.log(
      `credentialSubject:\n${JSON.stringify(
        verifiedResponse.payload.vc.credentialSubject
      )}`
    );
    console.log(verifiedResponse);
    done();
  });
});
