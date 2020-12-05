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
    if (secrets.REDIS_URL)
      this.store = new RedisStore({
        url: secrets.REDIS_URL,
        password: secrets.REDIS_PASSWORD
      })
  }

  async saveRequest(username, did) {
    const challengeCode = randomString(32)
    const data = {
      did,
      username,
      timestamp: Date.now(),
      challengeCode
    }
    try {
      await this.store.write(did, data)
      // console.log('Saved: ' + data)
    } catch (e) {
      throw new Error(`issue writing to the database for ${did}. ${e}`)
    }
    // await this.store.quit()
    return challengeCode
  }

  async findDidInGists(did, challengeCode) {
    if (!did) throw new Error('no did provided')
    if (!challengeCode) throw new Error('no challengeCode provided')

    let details
    try {
      details = await this.store.read(did)
    } catch (e) {
      throw new Error(
        `Error fetching from the database for user ${did}. Error: ${e}`
      )
    }
    console.log('Fetched: ' + JSON.stringify(details))
    if (!details) throw new Error(`No database entry for ${did}.`)

    // await this.store.quit()
    const { username, timestamp, challengeCode: _challengeCode } = details

    if (challengeCode !== _challengeCode)
      throw new Error(`Challenge Code is incorrect`)

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
    let verification_url = ''
    const gists = result.data
    if (!gists.length) return { verification_url, username }
    const fileName = Object.keys(gists[0].files)[0]
    const rawUrl = gists[0].files[fileName].raw_url
    const res = await fetch(rawUrl)
    const text = await res.text()
    if (text.includes(did)) verification_url = rawUrl
    // Return the raw URL of the gist containing the did
    return { verification_url, username }
  }
}

module.exports = GithubMgr
