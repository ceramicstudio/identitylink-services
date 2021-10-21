class TelegramVerifyHandler {
  constructor(telegramMgr, claimMgr, analytics) {
    this.name = 'TelegramVerifyHandler'
    this.telegramMgr = telegramMgr
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
      this.analytics.trackVerifyTelegram(body.jws, 403)
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
      this.analytics.trackVerifyTelegram(body.jws, 500)
      return
    }
    // Telegram usernames are unique, but no harm storing the userID also..
    let userId
    let username = ''
    try {
      const directMessageDetails = await this.telegramMgr.confirmRequest(
        did,
        challengeCode
      )
      userId = directMessageDetails.userId
      username = directMessageDetails.username
    } catch (e) {
      cb({
        code: 500,
        message: 'error while trying verify telegram. ' + e
      })
      this.analytics.trackVerifyTelegram(did, 500)
      return
    }

    let attestation = ''
    try {
      attestation = await this.claimMgr.issue({
        did,
        username,
        userId,
        type: 'Telegram'
      })
    } catch (e) {
      cb({ code: 500, message: 'could not issue a verification claim' + e })
      this.analytics.trackVerifyTelegram(did, 500)
      return
    }

    cb(null, { attestation })
    this.analytics.trackVerifyTelegram(did, 200)
  }
}
module.exports = TelegramVerifyHandler
