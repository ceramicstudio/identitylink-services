class GithubVerifyHandler {
  constructor(githubMgr, claimMgr, analytics) {
    this.name = 'GithubVerifyHandler'
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

    if (!body.jws) {
      cb({ code: 400, message: 'no jws' })
      this.analytics.trackVerifyGithub(body.jws, 400)
      return
    }

    let did = ''
    let challengeCode = ''
    const gistUrl = body.verificationUrl

    try {
      const unwrappped = await this.claimMgr.verifyJWS(body.jws)
      challengeCode = unwrappped.payload.challengeCode
      did = unwrappped.did
    } catch (e) {
      console.log(e)
      cb({ code: 500, message: 'error while trying to verify the JWS' })
      this.analytics.trackVerifyGithub(body.jws, 500)
      return
    }

    let verification_url
    let username = ''
    try {
      ({ verification_url, username } = await this.githubMgr.findDidInGists(
        did,
        challengeCode,
        gistUrl
      ))
    } catch (e) {
      cb({ code: 500, message: 'error while trying to find a Gist. ' + e })
      this.analytics.trackVerifyGithub(did, 500)
      return
    }

    if (!verification_url || verification_url == '') {
      cb({ code: 400, message: 'no valid gist found' })
      this.analytics.trackVerifyGithub(did, 400)
      return
    }

    let attestation = ''
    try {
      attestation = await this.claimMgr.issue({
        did,
        username,
        verification_url,
        type: 'Github'
      })
    } catch (e) {
      cb({ code: 500, message: 'could not issue a verification claim' + e })
      this.analytics.trackVerifyGithub(did, 500)
      return
    }

    cb(null, { attestation })
    this.analytics.trackVerifyGithub(did, 200)
  }
}
module.exports = GithubVerifyHandler
