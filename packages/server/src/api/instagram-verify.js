class InstagramVerifyHandler {
  constructor(instagramMgr, claimMgr, analytics) {
    this.name = 'InstagramVerifyHandler'
    this.instagramMgr = instagramMgr
    this.claimMgr = claimMgr
    this.analytics = analytics
  }

  async handle(event, context, cb) {
    let body
    try {
      body = JSON.parse(event.body)
    } catch (e) {
      cb({ code: 400, message: 'no json body: ' + e.toString() })
      return
    }

    if (!body.jws) {
      cb({ code: 400, message: 'no jws' })
      this.analytics.trackVerifyInstagram(body.jws, 400)
      return
    }
    if (!body.code) {
      cb({ code: 400, message: 'no code' })
      this.analytics.trackVerifyInstagram(body.jws, 400)
      return
    }

    let did = ''
    let challengeCode = ''
    const code = body.code

    try {
      const unwrappped = await this.claimMgr.verifyJWS(body.jws)
      challengeCode = unwrappped.payload.challengeCode
      did = unwrappped.did
    } catch (e) {
      cb({ code: 500, message: 'error while trying to verify the JWS' })
      this.analytics.trackVerifyInstagram(body.jws, 500)
      return
    }

    let userId
    let username = ''
    try {
      const me = await this.instagramMgr.validateProfileFromAccount(
        did,
        challengeCode,
        code
      )
      username = me.username
      userId = me.id
    } catch (e) {
      cb({
        code: 500,
        message: 'error while trying verify Instagram. ' + e
      })
      this.analytics.trackVerifyInstagram(did, 500)
      return
    }

    let attestation = ''

    try {
      attestation = await this.claimMgr.issue({
        did,
        username,
        userId,
        type: 'Instagram'
      })
    } catch (e) {
      cb({ code: 500, message: 'could not issue a verification claim' + e })
      this.analytics.trackVerifyInstagram(did, 500)
      return
    }

    cb(null, { attestation })
    this.analytics.trackVerifyInstagram(did, 200)
  }
}
module.exports = InstagramVerifyHandler
