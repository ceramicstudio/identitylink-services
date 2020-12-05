import { randomString } from '@stablelib/random'
const Twit = require('twit')

class TwitterMgr {
  constructor() {
    this.consumer_key = null
    this.consumer_secret = null
    this.access_token = null
    this.access_token_secret = null
    this.client = null
    this.store = {}
  }

  isSecretsSet() {
    return (
      this.consumer_key !== null ||
      this.consumer_secret !== null ||
      this.access_token !== null ||
      this.access_token_secret !== null
    )
  }

  setSecrets(secrets) {
    this.consumer_key = secrets.TWITTER_CONSUMER_KEY
    this.consumer_secret = secrets.TWITTER_CONSUMER_SECRET
    this.access_token = secrets.TWITTER_ACCESS_TOKEN
    this.access_token_secret = secrets.ACCESS_TOKEN_SECRET

    this.client = new Twit({
      consumer_key: this.consumer_key,
      consumer_secret: this.consumer_secret,
      access_token: this.access_token,
      access_token_secret: this.access_token_secret,
      app_only_auth: true
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
      console.log(did)
      console.log(data)
      console.log(this.store)
      await this.store.write(did, data)
      console.log('Saved: ' + data)
    } catch (e) {
      throw new Error(`issue writing to the database for ${did}. ${e}`)
    }
    // await this.store.quit()
    return challengeCode
  }

  async findDidInTweets(did, challengeCode) {
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

    let params = {
      screen_name: username,
      tweet_mode: 'extended',
      exclude_replies: true,
      include_rts: false,
      count: 5
    }
    return this.client
      .get('statuses/user_timeline', params)
      .catch(err => {
        console.log('caught error', err.stack)
      })
      .then(res => {
        let verification_url = ''
        res.data.forEach(tweet => {
          if (tweet.full_text.includes(did))
            verification_url = `https://twitter.com/${username}/status/${tweet.id_str}`
        })
        return { verification_url, username }
      })
  }
}

module.exports = TwitterMgr
