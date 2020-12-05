class DiscordVerifyHandler {
  constructor(discordMgr, claimMgr, analytics) {
    this.name = 'DiscordVerifyHandler'
    this.discordMgr = discordMgr
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

    // TODO: Uncomment for production (if still necessary)
    // let domains = /https:\/\/(\w+\.)?(3box.io|foam.tools)/i
    // if (
    //   !domains.test(event.headers.origin) &&
    //   !domains.test(event.headers.Origin)
    // ) {
    //   cb({ code: 401, message: 'unauthorized' })
    //   this.analytics.trackVerifyDiscord(body.did, 401)
    //   return
    // }

    if (!body.jws) {
      cb({ code: 403, message: 'no jws' })
      this.analytics.trackVerifyDiscord(body.jws, 403)
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
      this.analytics.trackVerifyDiscord(body.jws, 500)
      return
    }
    let verification_url
    let username = ''
    try {
      const directMessageDetails = await this.discordMgr.findDidInDirectMessages(
        did,
        challengeCode
      )
      verification_url = directMessageDetails.verification_url
      username = directMessageDetails.username
    } catch (e) {
      cb({
        code: 500,
        message: 'error while trying to find a DirectMessage. ' + e
      })
      this.analytics.trackVerifyDiscord(did, 500)
      return
    }

    if (!verification_url || verification_url == '') {
      cb({ code: 400, message: 'no valid directMessage found' })
      this.analytics.trackVerifyDiscord(did, 400)
      return
    }
    let attestation = ''
    try {
      attestation = await this.claimMgr.issue({
        did,
        username,
        verification_url,
        type: 'Discord'
      })
    } catch (e) {
      cb({ code: 500, message: 'could not issue a verification claim' + e })
      this.analytics.trackVerifyDiscord(did, 500)
      return
    }

    cb(null, { attestation })
    this.analytics.trackVerifyDiscord(did, 200)
  }
}
module.exports = DiscordVerifyHandler
