const { createDid, verifyJWS } = require("../src/utils");

const PUBLIC_KEY = 3;

const main = async () => {
  const did = await createDid(PUBLIC_KEY);

  const jws = await signDid(did, { challengeCode: "some random challenge" });
};

main();
