const { generateKeyPairFromSeed } = require("@stablelib/ed25519");
const { randomBytes } = require("@stablelib/random");
const { encode } = require("@stablelib/hex");
const { secretKey, publicKey } = generateKeyPairFromSeed(randomBytes(32));

console.log(encode(secretKey,true));
console.log(encode(publicKey,true));