class TwitterRequestHandler {
  constructor(twitterMgr, claimMgr, analytics) {
    this.name = 'TwitterRequestHandler'
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

    if (!body.did) {
      cb({ code: 403, message: 'no did' })
      this.analytics.trackRequestTwitter(body.did, 403)
      return
    }
    if (!body.username) {
      cb({ code: 400, message: 'no twitter handle' })
      this.analytics.trackRequestTwitter(body.did, 400)
      return
    }

    let challengeCode = ''
    try {
      challengeCode = await this.twitterMgr.saveRequest(body.username, body.did)
    } catch (e) {
      cb({ code: 500, message: 'error while trying save to Redis' })
      this.analytics.trackRequestTwitter(body.did, 500)
      return
    }

    cb(null, { challengeCode })
    // this.analytics.trackRequestTwitter(body.did, 200)
  }
}
module.exports = TwitterRequestHandler
