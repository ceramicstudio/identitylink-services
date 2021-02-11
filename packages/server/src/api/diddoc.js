class DidDocumentHandler {
  constructor(claimMgr) {
    this.name = 'DidDocumentHandler'
    this.claimMgr = claimMgr
  }

  async handle(event, context, cb) {
    let publicKeyHex = this.claimMgr.getPublicKeyHex()
    let issuerDomain = this.claimMgr.getIssuerDomain()

    let body = {
      '@context': 'https://w3id.org/did/v1',
      id: `did:web:${issuerDomain}`,
      publicKey: [
        {
          id: `did:web:${issuerDomain}#owner`,
          type: 'Secp256k1VerificationKey2018',
          owner: `did:web:${issuerDomain}`,
          publicKeyHex: publicKeyHex
        }
      ],
      authentication: [
        {
          type: 'Secp256k1SignatureAuthentication2018',
          publicKey: `did:web:${issuerDomain}#owner`
        }
      ]
    }

    cb(null, body)
  }
}
module.exports = DidDocumentHandler
