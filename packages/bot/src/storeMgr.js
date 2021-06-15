const { randomString } = require('@stablelib/random')
const redis = require('redis')

class StoreMgr {
  constructor() {
    this.store = redis.createClient({
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD
    })
  }

  async saveRequest({ username, did, userId }) {
    if (!did) throw new Error('no did')
    if (!username) throw new Error('no discord handle')
    if (!userId) throw new Error('no user ID')

    let challengeCode = randomString(32)

    const data = {
      did,
      username,
      timestamp: Date.now(),
      challengeCode,
      userId
    }
    try {
      await this.store.set(did, JSON.stringify(data))
    } catch (e) {
      console.log(e)
      throw new Error(`issue writing to the database for ${did}. ${e}`)
    }
    // await this.store.quit()
    return challengeCode
  }
}

module.exports = StoreMgr
