import { randomString } from '@stablelib/random'
import fetch from 'node-fetch'

const { RedisStore } = require('./store')

const challengeKey = did => `${did}:instagram`

class InstagramMgr {
  constructor() {
    this.client = null
    this.client_id = null
    this.client_secret = null
    this.redirect_uri = null
    this.http_redirect = null
    this.store = {}
  }

  isSecretsSet() {
    return (
      this.client_id !== null ||
      this.client_secret !== null ||
      this.redirect_uri !== null
    )
  }

  setSecrets(secrets) {
    this.client = fetch

    this.client_id = secrets.INSTAGRAM_CLIENT_ID
    this.client_secret = secrets.INSTAGRAM_CLIENT_SECRET
    this.redirect_uri = secrets.INSTAGRAM_REDIRECT_URI
    this.http_redirect = secrets.INSTAGRAM_HTTP_REDIRECT

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

  // Returns verification url if sucessful
  generateRedirectionUrl(challengeCode) {
    return `https://api.instagram.com/oauth/authorize/?client_id=${this.client_id}&redirect_uri=${this.redirect_uri}&scope=user_profile&response_type=code&state=${challengeCode}`
  }

  async validateProfileFromAccount(did, challengeCode, code) {
    if (!did) throw new Error('no did provided')
    if (!challengeCode) throw new Error('no challengeCode provided')
    if (!code) throw new Error('no authorization code provided')

    let details
    try {
      details = await this.store.read(challengeKey(did))
    } catch (e) {
      throw new Error(
        `Error fetching from the database for user ${did}. Error: ${e}`
      )
    }
    // console.log('Fetched: ' + JSON.stringify(details))
    if (!details || !details.username)
      throw new Error(`No database entry for ${did}`)

    // await this.store.quit()
    const { username, timestamp, challengeCode: _challengeCode } = details

    if (challengeCode !== _challengeCode)
      throw new Error(`Challenge Code is incorrect`)

    const startTime = new Date(timestamp)
    if (new Date() - startTime > 30 * 60 * 1000)
      throw new Error(
        'The challenge must have been generated within the last 30 minutes'
      )

    // Convert the Instagram code to an Oauth Access token and query /me to verify the user
    const params = new URLSearchParams()
    params.append('client_id', this.client_id)
    params.append('client_secret', this.client_secret)
    params.append('grant_type', 'authorization_code')
    params.append('redirect_uri', this.redirect_uri)
    params.append('code', code)

    try {
      const response = await this.client(
        'https://api.instagram.com/oauth/access_token',
        {
          method: 'post',
          body: params
        }
      )
      const data = await response.json()

      const me = await this.client(
        `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${data.access_token}`
      )
      const meData = await me.json()

      if (username !== meData.username) {
        throw new Error(
          `Verification made for the wrong username (${username} != ${meData.username})`
        )
      }

      return meData
    } catch (e) {
      throw new Error(`Could not validate user from Instagram. ${e}`)
    }
  }
}

module.exports = InstagramMgr
