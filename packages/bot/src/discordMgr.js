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
    // await this.store.quit()
    return challengeCode
  }
}

module.exports = DiscordMgr
