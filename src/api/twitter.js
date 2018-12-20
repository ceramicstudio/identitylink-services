class TwitterHandler {
  constructor (twitterMgr, claimMgr, analytics) {
    this.name = 'TwitterHandler'
    this.twitterMgr = twitterMgr
    this.claimMgr = claimMgr
    this.analytics = analytics
  }

  async handle (event, context, cb) {
    let body
    try {
      body = JSON.parse(event.body)
    } catch (e) {
      cb({ code: 400, message: 'no json body: ' + e.toString() })
      return
    }

    let domains = /https:\/\/(\w+\.)?(3box.io|foam.tools)/i

    if (!domains.test(event.headers.origin) && !domains.test(event.headers.Origin)) {
      cb({ code: 401, message: 'unauthorized' })
      this.analytics.trackVerifyTwitter(body.did, 401)
      return
    }

    if (!body.did) {
      cb({ code: 403, message: 'no did' })
      this.analytics.trackVerifyTwitter(body.did, 403)
      return
    }
    if (!body.twitter_handle) {
      cb({ code: 400, message: 'no twitter handle' })
      this.analytics.trackVerifyTwitter(body.did, 400)
      return
    }

    let verification_url = ''
    try {
      verification_url = await this.twitterMgr.findDidInTweets(body.twitter_handle, body.did)
    } catch (e) {
      cb({ code: 500, message: 'error while trying to verify the did' })
      this.analytics.trackVerifyTwitter(body.did, 500)
      return
    }

    if (verification_url == '') {
      cb({ code: 400, message: 'no valid proof available' })
      this.analytics.trackVerifyTwitter(body.did, 400)
      return
    }

    let verification_claim = ''
    try {
      verification_claim = await this.claimMgr.issueTwitter(body.did, body.twitter_handle, verification_url)
    } catch (e) {
      cb({ code: 500, message: 'could not issue a verification claim' })
      this.analytics.trackVerifyTwitter(body.did, 500)
      return
    }

    cb(null, { verification: verification_claim })
    this.analytics.trackVerifyTwitter(body.did, 200)
  }
}
module.exports = TwitterHandler
