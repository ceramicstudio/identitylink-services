import { randomString, randomBytes } from "@stablelib/random";

const {
  createDid,
  signDid,
  verifyJWS,
  issueGithubClaim,
  verifyJWT,
  createRandomSecp256k1,
} = require("../utils");

const mockServiceDid = {
  "@context": "https://w3id.org/did/v1",
  id: "did:web:verifications.3boxlabs.com",
  publicKey: [
    {
      id: "did:web:verifications.3boxlabs.com#owner",
      type: "Secp256k1VerificationKey2018",
      owner: "did:web:verifications.3boxlabs.com",
      publicKeyHex: "",
    },
  ],
  authentication: [
    {
      type: "Secp256k1SignatureAuthentication2018",
      publicKey: "did:web:verifications.3boxlabs.com#owner",
    },
  ],
};

let did = null;
let jws = null;
let challengeCode = null;
let jwt = null;
let privateKey = null;
let publicKey = null;

describe("Utils", () => {
  beforeAll(() => {});

  test("createRandomSecp256k1", async (done) => {
    const keys = await createRandomSecp256k1();
    ({ privateKey, publicKey } = keys);
    console.log(
      `Service public key:\n${publicKey}\nService private key:\n${privateKey}`
    );
    expect(publicKey).not.toBeUndefined();
    expect(privateKey).not.toBeUndefined();
    done();
  });

  test("createDid", (done) => {
    createDid(randomBytes(32)).then((res) => {
      did = res;
      expect(/did:key:[a-zA-Z0-9]{48}/.test(did.id)).toBe(true);
      console.log(`User did:\n${did.id}`);
      done();
    });
  });

  test("signDid", (done) => {
    // challengeCode = randomString(32);
    challengeCode = "Py3AnyWL1OupvuB20tyG8MaaC3FCrwoz";
    console.log(`challenge code:\n${challengeCode}`);
    signDid(did, { challengeCode }).then((res) => {
      expect(res).not.toBeNull();
      jws = res;
      done();
    });
  });

  test("verifyJWS", (done) => {
    verifyJWS(jws).then(({ payload, id }) => {
      console.log(
        `User jws:\n  payload: ${JSON.stringify(payload)}\n  did:\n${id}`
      );
      done();
    });
  });

  test("issueGithubClaim", (done) => {
    issueGithubClaim(did, "guy", "https://someurl.com", privateKey).then(
      (res) => {
        jwt = res;
        console.log(`confirm-github jwt:\n${jwt}`);
        done();
      }
    );
  });

  test("verifyJWT", async (done) => {
    mockServiceDid.publicKey[0].publicKeyHex = publicKey;
    const verifiedResponse = await verifyJWT(jwt, mockServiceDid);
    console.log(verifiedResponse);
    done();
  });
});
