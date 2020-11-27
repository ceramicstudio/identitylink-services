class GithubRequestHandler {
  constructor(githubMgr, claimMgr, store, analytics) {
    this.name = 'GithubRequestHandler'
    this.githubMgr = githubMgr
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
    //   this.analytics.trackRequestGithub(did, 401)
    //   return
    // }

    if (!body.did) {
      cb({ code: 403, message: 'no did' })
      this.analytics.trackRequestGithub(body.did, 403)
      return
    }
    if (!body.username) {
      cb({ code: 400, message: 'no github handle' })
      this.analytics.trackRequestGithub(body.did, 400)
      return
    }

    let challengeCode = ''

    try {
      challengeCode = await this.githubMgr.saveRequest(body.username, body.did)
    } catch (e) {
      cb({ code: 500, message: 'error while trying save to Redis' })
      // this.analytics.trackRequestGithub(body.did, 500)
      return
    }

    cb(null, { challengeCode })
    // this.analytics.trackRequestGithub(body.did, 200)
  }
}
module.exports = GithubRequestHandler
