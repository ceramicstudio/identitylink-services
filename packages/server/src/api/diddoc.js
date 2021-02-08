class DidDocumentHandler {
  constructor(claimMgr) {
    this.name = 'DidDocumentHandler'
    this.claimMgr = claimMgr
  }

  async handle(event, context, cb) {
    let publicKeyHex = this.claimMgr.getPublicKeyHex()

    let body = {
      '@context': 'https://w3id.org/did/v1',
      id: 'did:web:verifications.3boxlabs.com',
      publicKey: [
        {
          id: 'did:web:verifications.3boxlabs.com#owner',
          type: 'Secp256k1VerificationKey2018',
          owner: 'did:web:verifications.3boxlabs.com',
          publicKeyHex: publicKeyHex,
        }
      ],
      authentication: [
        {
          type: 'Secp256k1SignatureAuthentication2018',
          publicKey: 'did:web:verifications.3boxlabs.com#owner',
        }
      ]
    }

    cb(null, body)
  }
}
module.exports = DidDocumentHandler
