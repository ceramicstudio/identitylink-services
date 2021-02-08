const { generateKeyPairFromSeed } = require("@stablelib/ed25519")
const { randomBytes } = require("@stablelib/random")

const b16 = (u8) => (
  Buffer.from(u8).toString('hex')
)

const seed = process.env.IDLINK_SEED || b16(randomBytes(32))

console.info(seed)

const { secretKey, publicKey } = generateKeyPairFromSeed(
  Uint8Array.from(Buffer.from(seed, 'hex'))
)

console.log(b16(secretKey))
console.log(b16(publicKey))
