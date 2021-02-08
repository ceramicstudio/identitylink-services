const { generateKeyPairFromSeed } = require("@stablelib/ed25519");
const { randomBytes } = require("@stablelib/random");

const { secretKey, publicKey } = generateKeyPairFromSeed(randomBytes(32));

console.log(secret);
console.log(public);
