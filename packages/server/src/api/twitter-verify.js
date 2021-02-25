class TwitterVerifyHandler {
  constructor(twitterMgr, claimMgr, analytics) {
    this.name = 'TwitterVerifyHandler'
    this.twitterMgr = twitterMgr
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
      cb({ code: 403, message: 'no jws' })
      this.analytics.trackVerifyTwitter(body.jws, 403)
      return
    }

    let did = ''
    let challengeCode = ''
    const tweetUrl = body.verificationUrl

    try {
      const unwrappped = await this.claimMgr.verifyJWS(body.jws)
      challengeCode = unwrappped.payload.challengeCode
      did = unwrappped.did
    } catch (e) {
      cb({ code: 500, message: 'error while trying to verify the JWS' })
      this.analytics.trackVerifyTwitter(body.jws, 500)
      return
    }
    let verification_url
    let username = ''
    try {
      const tweetDetails = await this.twitterMgr.findDidInTweets(
        did,
        challengeCode, 
        tweetUrl
      )
      verification_url = tweetDetails.verification_url
      username = tweetDetails.username
    } catch (e) {
      cb({ code: 500, message: 'error while trying to find a Tweet. ' + e })
      this.analytics.trackVerifyTwitter(did, 500)
      return
    }

    if (!verification_url || verification_url == '') {
      cb({ code: 400, message: 'no valid tweet found' })
      this.analytics.trackVerifyTwitter(did, 400)
      return
    }
    let attestation = ''
    try {
      attestation = await this.claimMgr.issue({
        did,
        username,
        verification_url,
        type: 'Twitter'
      })
    } catch (e) {
      cb({ code: 500, message: 'could not issue a verification claim' + e })
      this.analytics.trackVerifyTwitter(did, 500)
      return
    }

    cb(null, { attestation })
    this.analytics.trackVerifyTwitter(did, 200)
  }
}
module.exports = TwitterVerifyHandler
