import { randomString } from '@stablelib/random'
const { RedisStore } = require('./store')

class StoreMgr {
  constructor() {
    this.store = new RedisStore({
      url: provess.env.REDIS_URL,
      password: provess.env.REDIS_PASSWORD
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

module.exports = StoreMgr
