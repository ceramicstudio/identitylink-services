const { RedisStore } = require('./store')

class TelegramMgr {
  constructor() {
    this.store = null
  }

  isSecretsSet() {
    return !!this.store
  }

  setSecrets(secrets) {
    if (secrets.REDIS_URL)
      this.store = new RedisStore({
        host: secrets.REDIS_URL
      })
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
    // console.log('Fetched: ' + JSON.stringify(details))
    if (!details || !details.username)
      throw new Error(`No database entry for ${did}`)

    // await this.store.quit()
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

module.exports = TelegramMgr
