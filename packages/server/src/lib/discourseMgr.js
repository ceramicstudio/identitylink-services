import { randomString } from '@stablelib/random'
import fetch from 'node-fetch'

const { RedisStore } = require('./store')

const challengeKey = (did) => `${did}:discourse`

class DiscourseMgr {
  constructor() {
    this.client = null
    this.store = {}
  }

  setSecrets(secrets) {
    this.client = fetch

    // Create redis store
    if (secrets.REDIS_URL) {
      this.store = new RedisStore({
        host: secrets.REDIS_URL
      })
    }
  }

  async saveRequest(username, did, threadUrl) {
    // Create data object
    const data = {
      did,
      username,
      threadUrl,
      timestamp: Date.now(),
      challengeCode: randomString(32)
    }

    // Save data object into redis
    try {
      await this.store.write(challengeKey(did), data)
    } catch (e) {
      throw new Error(`issue writing to the database for ${did}. ${e}`)
    }

    // Return challenge code
    return data.challengeCode
  }

  async findDidInThread(did, challengeCode) {
    // Check if did and challenge code are provided
    if (!did) throw new Error('no did provided')
    if (!challengeCode) throw new Error('no challengeCode provided')

    // Check if redis has data for did
    let details
    try {
      details = await this.store.read(challengeKey(did))
    } catch (e) {
      throw new Error(`Error fetching from the database for user ${did}. Error: ${e}`)
    }
    if (!details) throw new Error(`No database entry for ${did}.`)

    // Deconstruct data
    const { username, timestamp, challengeCode: _challengeCode, threadUrl } = details

    // Check if challenge code matches
    if (challengeCode !== _challengeCode)
      throw new Error(`Challenge Code is incorrect`)

    // Check if is in timerange
    if (new Date() - new Date(timestamp) > 30 * 60 * 1000) {
      throw new Error('The challenge must have been generated within the last 30 minutes')
    }

    // Check if threadUrl ends with slash and then add `.json`
    const finalThreadUrl = (threadUrl.substr(-1) === '/' ? threadUrl.slice(0, -1) : threadUrl) + '.json?print=true'

    // Check if did is found inside threadUrl
    try {
      const response = await this.client( finalThreadUrl, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      const validPost = data.post_stream.posts.find(post => post.username === username && post.cooked.includes(did))

      if (!validPost) {
        return { username, verification_url: '' }
      }
    } catch (e) {
      throw new Error('Could not fetch discourse thread')
    }

    
    return { username, verification_url: threadUrl }
  }
}

module.exports = DiscourseMgr
