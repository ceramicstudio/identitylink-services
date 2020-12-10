const fn = async () => {
  const prompt = require("prompt");
  const { randomBytes } = require("@stablelib/random");
  const { Ed25519Provider } = require("key-did-provider-ed25519");
  const { DID } = require("dids");
  const resolver = require("@ceramicnetwork/key-did-resolver").default.getResolver();

  const didJWT = require("did-jwt");
  const { getResolver } = require("web-did-resolver");

  const provider = new Ed25519Provider(randomBytes(32));
  const did = new DID({ provider, resolver });
  await did.authenticate();
  console.log("DID:", did.id);

  prompt.start();
  prompt.get(["challengeCode"], async (err, { challengeCode }) => {
    const jws = await did.createJWS({ challengeCode });
    console.log(
      "JWS:",
      `${jws.signatures[0].protected}.${jws.payload}.${jws.signatures[0].signature}`
    );
  });
};
fn();
