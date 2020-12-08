class DiscordRequestHandler {
  constructor(discordMgr, claimMgr, analytics) {
    this.name = 'DiscordRequestHandler'
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
    //   this.analytics.trackRequestDiscord(body.did, 401)
    //   return
    // }

    if (!body.did) {
      cb({ code: 403, message: 'no did' })
      this.analytics.trackRequestDiscord(body.did, 403)
      return
    }
    if (!body.username) {
      cb({ code: 400, message: 'no discord handle' })
      this.analytics.trackRequestDiscord(body.did, 400)
      return
    }
    if (!body.userId) {
      cb({ code: 400, message: 'no user ID' })
      this.analytics.trackRequestDiscord(body.did, 400)
      return
    }

    let challengeCode = ''
    try {
      challengeCode = await this.discordMgr.saveRequest(body.username, body.did)
    } catch (e) {
      cb({ code: 500, message: 'error while trying save to Redis' })
      this.analytics.trackRequestDiscord(body.did, 500)
      return
    }

    cb(null, { challengeCode })
    // this.analytics.trackRequestDiscord(body.did, 200)
  }
}
module.exports = DiscordRequestHandler
