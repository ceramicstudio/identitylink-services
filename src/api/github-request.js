class GithubRequestHandler {
  constructor(githubMgr, claimMgr, analytics) {
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

    let domains = /https:\/\/(\w+\.)?(3box.io|foam.tools)/i

    if (
      !domains.test(event.headers.origin) &&
      !domains.test(event.headers.Origin)
    ) {
      cb({ code: 401, message: 'unauthorized' })
      this.analytics.trackRequestGithub(body.did, 401)
      return
    }

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

    let challenge = ''
    let status = ''

    try {
      verification_url = await this.githubMgr.findDidInGists(
        body.github_handle,
        body.did
      )
    } catch (e) {
      cb({ code: 500, message: 'error while trying to verify the did' })
      this.analytics.trackRequestGithub(body.did, 500)
      return
    }

    let verification_claim = ''
    try {
      verification_claim = await this.claimMgr.issueGithub(
        body.did,
        body.github_handle,
        verification_url
      )
    } catch (e) {
      cb({ code: 500, message: 'could not issue a verification claim' })
      this.analytics.trackRequestGithub(body.did, 500)
      return
    }

    cb(null, { verification: verification_claim })
    this.analytics.trackRequestGithub(body.did, 200)
  }
}
module.exports = GithubRequestHandler
