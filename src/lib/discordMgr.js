import { randomString } from '@stablelib/random'
const { RedisStore } = require('./store')

class DiscordMgr {
  constructor() {
    this.store = null
  }

  isSecretsSet() {
    return !!this.store
  }

  setSecrets(secrets) {
    if (secrets.REDIS_URL)
      this.store = new RedisStore({
        url: secrets.REDIS_URL,
        password: secrets.REDIS_PASSWORD
      })
  }

  async saveRequest(username, did, userId) {
    const challengeCode = randomString(32)
    const data = {
      did,
      username,
      timestamp: Date.now(),
      challengeCode,
      userId
    }
    try {
      await this.store.write(did, data)
      // console.log('Saved: ' + data)
    } catch (e) {
      console.log(e)
      throw new Error(`issue writing to the database for ${did}. ${e}`)
    }
    await this.store.quit()
    return challengeCode
  }

  async confirmRequest(did, challengeCode) {
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

    await this.store.quit()
    const {
      username,
      timestamp,
      challengeCode: _challengeCode,
      userId
    } = details

    if (challengeCode !== _challengeCode)
      throw new Error(`Challenge Code is incorrect`)

    const startTime = new Date(timestamp)
    if (new Date() - startTime > 30 * 60 * 1000)
      throw new Error(
        'The challenge must have been generated within the last 30 minutes'
      )
    return { username, userId }
  }
}

module.exports = DiscordMgr
