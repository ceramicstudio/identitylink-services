class DiscourseVerifyHandler {
  constructor(discourseMgr, claimMgr, analytics) {
    this.name = 'DiscourseVerifyHandler'
    this.discourseMgr = discourseMgr
    this.claimMgr = claimMgr
    this.analytics = analytics
  }

  async handle(event, _context, cb) {
    let body
    try {
      body = JSON.parse(event.body)
    } catch (e) {
      cb({ code: 400, message: 'no json body: ' + e.toString() })
      return
    }

    if (!body.jws) {
      cb({ code: 400, message: 'no jws' })
      this.analytics.trackVerifyDiscourse(body.jws, 400)
      return
    }

    let did = ''
    let challengeCode = ''

    try {
      const unwrappped = await this.claimMgr.verifyJWS(body.jws)
      challengeCode = unwrappped.payload.challengeCode
      did = unwrappped.did
    } catch (e) {
      cb({ code: 500, message: 'error while trying to verify the JWS' })
      this.analytics.trackVerifyDiscourse(body.jws, 500)
      return
    }

    let username = ''
    let verification_url = ''
    try {
      ({ username, verification_url } = await this.discourseMgr.findDidInThread(
        did,
        challengeCode
      ))
    } catch (e) {
      cb({ code: 500, message: 'error while trying to find the challenge in the given discourse thread. ' + e })
      this.analytics.trackVerifyDiscourse(did, 500)
      return
    }

    if (!username || username == '' || !verification_url || verification_url == '') {
      cb({ code: 400, message: 'no valid post in thread found' })
      this.analytics.trackVerifyDiscourse(did, 400)
      return
    }

    let attestation = ''
    try {
      attestation = await this.claimMgr.issue({
        did,
        username,
        verification_url,
        type: 'Discourse'
      })
    } catch (e) {
      cb({ code: 500, message: 'could not issue a verification claim' + e })
      this.analytics.trackVerifyDiscourse(did, 500)
      return
    }

    cb(null, { attestation })
    this.analytics.trackVerifyDiscourse(did, 200)
  }
}
module.exports = DiscourseVerifyHandler
