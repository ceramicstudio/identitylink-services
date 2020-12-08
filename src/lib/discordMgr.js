import { randomString } from '@stablelib/random'
const Discord = require('discord.js')
const { RedisStore } = require('./store')

const DISCORD_INITIAL_PROMPT_TEXT = `Hi there! Let's get your verified.\n\nPlease paste your \`did\` here (eg. "did:key:z6MkoT...nWqd")`

class DiscordMgr {
  constructor() {
    this.token = null
    this.client = null
    this.store = {}
  }

  isSecretsSet() {
    return this.token !== null
  }

  setSecrets(secrets) {
    this.token = secrets.DISCORD_TOKEN
    this.client = new Discord.Client()

    if (secrets.REDIS_URL)
      this.store = new RedisStore({
        url: secrets.REDIS_URL,
        password: secrets.REDIS_PASSWORD
      })
  }

  async startDirectMessage(username) {
    if (!username) throw new Error('no username provided')

    await this.client.on('ready', async () => {
      console.log('Discord client initilized')
    })
    await this.client.login(this.token)
    let user
    console.log(username)
    console.log(this.client.guilds.cache.get('785626426778714112'))
    try {
      user = await this.client.users.cache.get(username)
      console.log({ user: await this.client.users.cache.get(username) })
    } catch (e) {
      throw new Error(`issue gettting user ${username}. ${e}`)
    }
    if (!user) throw new Error('user not found')

    let channelId
    try {
      user.send(DISCORD_INITIAL_PROMPT_TEXT).then(message => {
        console.log(`Sent message: ${message.content}`)
        console.log(message)
        channelId = message.id
      })
    } catch (e) {
      throw new Error(`couldn't message user ${username}. ${e}`)
    }

    const channel = new Discord.DMChannel(this.client, data)
    channel
      .send(DISCORD_INITIAL_PROMPT_TEXT)
      .then(message => console.log(`Sent message: ${message.content}`))
      .catch(console.error)
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

  async findDidInDirectMessages(did, challengeCode) {
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

    client.on('ready', () => {
      console.log(`Logged in as ${client.user.tag}!`)
    })
    client.login('token')
    client.on('message', msg => {
      if (msg.content === 'ping') {
        msg.reply('pong')
      }
    })

    // return this.client
    //   .get('statuses/user_timeline', params)
    //   .catch(err => {
    //     console.log('caught error', err.stack)
    //   })
    //   .then(res => {
    //     let verification_url = ''
    //     res.data.forEach(tweet => {
    //       if (tweet.full_text.includes(did))
    //         verification_url = `https://twitter.com/${username}/status/${tweet.id_str}`
    //     })
    //     return { verification_url, username }
    //   })
  }
}

module.exports = DiscordMgr
