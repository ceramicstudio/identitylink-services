class InstagramRequestHandler {
  constructor(instagramMgr, claimMgr, analytics) {
    this.name = 'InstagramRequestHandler'
    this.instagramMgr = instagramMgr
    this.claimMgr = claimMgr
    this.analytics = analytics
  }

  async handle(event, context, cb) {
    let did, username
    if (event.queryStringParameters) {
      did = event.queryStringParameters.did
      username = event.queryStringParameters.username
    } else {
      cb({ code: 400, message: 'no did nor username' })
      this.analytics.trackRequestInstagram(did, 400)
      return
    }

    if (!did) {
      cb({ code: 403, message: 'no did' })
      this.analytics.trackRequestInstagram(did, 403)
      return
    }
    if (!username) {
      cb({ code: 400, message: 'no username' })
      this.analytics.trackRequestInstagram(did, 400)
      return
    }

    let challengeCode = ''
    try {
      challengeCode = await this.instagramMgr.saveRequest(username, did)
    } catch (e) {
      console.error(e)
      cb({ code: 500, message: `Error while trying save to Redis` })
      this.analytics.trackRequestInstagram(did, 500)
      return
    }

    const response = {
      statusCode: 307,
      headers: {
        Location: this.instagramMgr.generateRedirectionUrl(challengeCode)
      },
      body: ''
    }

    this.analytics.trackRequestInstagram(did, 307)
    cb(null, response)
  }
}
module.exports = InstagramRequestHandler
