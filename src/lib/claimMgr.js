// import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { DID } from 'dids'
import KeyResolver from '@ceramicnetwork/key-did-resolver'

const didJWT = require('did-jwt')

class ClaimMgr {
  constructor() {
    this.signerPrivate = null
    this.signerPublic = null
  }

  isSecretsSet() {
    return this.signerPrivate !== null && this.signerPublic !== null
  }

  async setSecrets(secrets) {
    this.signerPrivate = secrets.KEYPAIR_PRIVATE_KEY
    this.signerPublic = secrets.KEYPAIR_PUBLIC_KEY
    this.resolver = {
      registry: {
        ...KeyResolver.getResolver()
        // ...ThreeIdResolver.getResolver(),
      }
    }
  }

  async issueTwitter(did, handle, url) {
    const signer = didJWT.SimpleSigner(this.signerPrivate)
    return didJWT
      .createJWT(
        {
          sub: did,
          iat: Math.floor(Date.now() / 1000),
          claim: {
            twitter_handle: handle,
            twitter_proof: url
          }
        },
        {
          issuer: 'did:https:verifications.3box.io',
          signer
        }
      )
      .then(jwt => {
        return jwt
      })
      .catch(err => {
        console.log(err)
      })
  }

  async issueGithub(did, username, verification_url) {
    const signer = didJWT.SimpleSigner(this.signerPrivate)
    return didJWT
      .createJWT(
        {
          sub: did,
          nbf: Math.floor(Date.now() / 1000),
          vc: {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential'],
            credentialSubject: {
              account: {
                type: 'Github',
                username,
                url: verification_url
              }
            }
          }
        },
        {
          issuer: 'did:https:verifications.3box.io',
          signer
        }
      )
      .then(jwt => {
        return jwt
      })
      .catch(err => {
        console.log(err)
      })
  }

  async issueEmail(did, email) {
    const signer = didJWT.SimpleSigner(this.signerPrivate)
    return didJWT
      .createJWT(
        {
          sub: did,
          iat: Math.floor(Date.now() / 1000),
          claim: {
            email_address: email
          }
        },
        {
          issuer: 'did:https:verifications.3box.io',
          signer
        }
      )
      .then(jwt => {
        return jwt
      })
      .catch(err => {
        console.log(err)
      })
  }

  decode(jwt) {
    if (!this.signerPublic) throw new Error('no keypair created yet')
    return didJWT.decodeJWT(jwt)
  }

  getPublicKeyHex() {
    if (!this.signerPublic) throw new Error('no keypair created yet')
    return this.signerPublic
  }

  async verifyToken(token) {
    if (!token) throw new Error('no token')
    return didJWT.verifyJWT(token, { resolver: this.resolver })
  }

  async verifyJWS(jws) {
    if (!jws) throw new Error('no jws')
    const did = new DID({
      resolver: KeyResolver.getResolver()
    })
    const { kid, payload } = await did.verifyJWS(jws)
    return { kid, payload, did: kid.split('#')[0] }
  }
}

module.exports = ClaimMgr
