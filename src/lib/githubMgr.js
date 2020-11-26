import { request } from '@octokit/request'
import { randomString } from '@stablelib/random'
const fetch = require('node-fetch')

const { RedisStore } = require('./store')

class GithubMgr {
  constructor() {
    this.username = null
    this.personal_access_token = null
    this.client = null
    this.store = {}
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
    const TTL = 12345
    if (secrets.REDIS_URL)
      this.store = new RedisStore(
        { url: secrets.REDIS_URL, password: secrets.REDIS_PASSWORD },
        TTL
      )
  }

  async saveRequest(username, did) {
    const challengeCode = randomString(32)
    const data = {
      did,
      username,
      timestamp: Date.now(),
      challengeCode
    }
    await this.store.write(did, data)
    return challengeCode
  }

  async findDidInGists(did, challengeCode) {
    if (!did) throw new Error('no did provided')
    if (!challengeCode) throw new Error('no challengeCode provided')

    const details = await this.store.read(did)
    const { username, timestamp, challengeCode: _challengeCode } = details
    if (challengeCode !== _challengeCode)
      throw new Error('Challenge Code is incorrect')

    const startTime = new Date(timestamp)
    if (new Date() - startTime > 30 * 60 * 1000)
      throw new Error(
        'The challenge must have been generated within the last 30 minutes'
      )

    const thirtyMinutesAgo = new Date(
      new Date().setMinutes(new Date().getMinutes() - 30)
    )
    const result = await this.client('GET /users/:username/gists', {
      username,
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
