import { request } from '@octokit/request'
const fetch = require('node-fetch')

class GithubMgr {
  constructor() {
    this.username = null
    this.personal_access_token = null
    this.client = null
  }

  isSecretsSet() {
    return this.username !== null || this.personal_access_token !== null
  }

  setSecrets(secrets) {
    this.username = secrets.GITHUB_USERNAME
    this.personal_access_token = secrets.GITHUB_PERSONAL_ACCESS_TOKEN
    this.client = request
    if (secrets.GITHUB_PERSONAL_ACCESS_TOKEN)
      this.client = request.defaults({
        headers: {
          authorization: `token ${secrets.GITHUB_PERSONAL_ACCESS_TOKEN}`
        }
      })
  }

  async findDidInGists(handle, did) {
    if (!handle) throw new Error('no github handle provided')
    if (!did) throw new Error('no did provided')

    const thirtyMinutesAgo = new Date(
      new Date().setMinutes(new Date().getMinutes() - 30)
    )
    const result = await this.client('GET /users/:username/gists', {
      username: handle,
      since: thirtyMinutesAgo.toISOString()
    })
    let gistUrl = ''
    const gists = result.data
    if (!gists.length) return gistUrl

    const fileName = Object.keys(gists[0].files)[0]
    const rawUrl = gists[0].files[fileName].raw_url
    const res = await fetch(rawUrl)
    const text = await res.text()
    if (text.includes(did)) gistUrl = rawUrl

    // Return the raw URL of the gist containing the did
    return gistUrl
  }
}

module.exports = GithubMgr
