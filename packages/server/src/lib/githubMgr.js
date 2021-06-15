import { request } from '@octokit/request'
import { randomString } from '@stablelib/random'
import fetch from 'node-fetch'

const { RedisStore } = require('./store')

const challengeKey = (did) => `${did}:github`

class GithubMgr {
  constructor() {
    this.personal_access_token = null
    this.client = null
    this.store = {}
  }

  isSecretsSet() {
    return this.personal_access_token !== null
  }

  setSecrets(secrets) {
    this.secrets = secrets
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
        host: secrets.REDIS_URL
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
      await this.store.write(challengeKey(did), data)
      // console.log('Saved: ' + data)
    } catch (e) {
      throw new Error(`issue writing to the database for ${did}. ${e}`)
    }
    // await this.store.quit()
    return challengeCode
  }

  async findDidInGists(did, challengeCode, gistUrl) {
    if (!did) throw new Error('no did provided')
    if (!challengeCode) throw new Error('no challengeCode provided')

    let details
    try {
      details = await this.store.read(challengeKey(did))
    } catch (e) {
      throw new Error(
        `Error fetching from the database for user ${did}. Error: ${e}`
      )
    }
    // console.log('Fetched: ' + JSON.stringify(details))
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

    let rawUrl, verification_url
    if (!gistUrl) {
      const result = await this.client('GET /users/:username/gists', {
        username,
        since: thirtyMinutesAgo.toISOString()
      })
      const gists = result.data
      if (!gists.length) return { verification_url: '', username }
      const fileName = Object.keys(gists[0].files)[0]
      rawUrl = gists[0].files[fileName].raw_url
    } else {
      rawUrl = gistUrl
    }

    if (!rawUrl) throw new Error('Recent gist for verification not available')

    let res
    try {
      res = await fetch(rawUrl)
    } catch (e) {
      throw new Error(
        `Couldn't get raw gist. ${e}`
      )
    }
    const  text = await res.text()
    if (text && text.includes(did)) verification_url = rawUrl
    // Return the raw URL of the gist containing the did
    return { verification_url, username }
  }
}

module.exports = GithubMgr
