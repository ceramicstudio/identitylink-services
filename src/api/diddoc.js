class DidDocumentHandler {
    constructor(claimMgr) {
        this.name = "DidDocumentHandler"
        this.claimMgr = claimMgr
    }

    async handle(event, context, cb) {

        let publicKeyHex = this.claimMgr.getPublicKeyHex()

        let body = {
            "@context": "https://w3id.org/did/v1",
            "id": "did:https:verifications.3box.io",
            "publicKey": [{
                "id": "did:https:verifications.3box.io#owner",
                "type": "Secp256k1VerificationKey2018",
                "owner": "did:https:verifications.3box.io",
                "publicKeyHex": publicKeyHex
            }],
            "authentication": [{
                "type": "Secp256k1SignatureAuthentication2018",
                "publicKey": "did:https:verifications.3box.io#owner"
            }]
        }

        cb(null, body)
    }
}
module.exports = DidDocumentHandler