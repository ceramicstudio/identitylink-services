class InstagramVerifyHandler {
  constructor(instagramMgr, claimMgr, analytics) {
    this.name = 'InstagramVerifyHandler'
    this.instagramMgr = instagramMgr
    this.claimMgr = claimMgr
    this.analytics = analytics
  }

  async handle(event, context, cb) {
    let error = event.queryStringParameters.error
    let errorReason = event.queryStringParameters.error_reason
    let errorDescription = event.queryStringParameters.error_description

    if (error) {
      cb({
        code: 400,
        message: `user cancelled login flow (${error}: ${errorReason} , ${errorDescription} .`
      })
      return
    }

    let code = event.queryStringParameters.code
    let [did, challengeCode] = event.queryStringParameters.state.split(',')

    if (!code) {
      cb({ code: 400, message: 'no code in query param.' })
      return
    }
    if (!did) {
      cb({ code: 400, message: 'no did in query param.' })
      return
    }
    if (!challengeCode) {
      cb({ code: 400, message: 'no challengeCode in query param.' })
      return
    }

    let userId
    let username = ''
    try {
      const me = this.instagramMgr.validateProfileFromAccount(did, challengeCode, code)
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
