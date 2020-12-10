require('dotenv').config()
const Discord = require('discord.js')
const fetch = require('node-fetch')
const StoreMgr = require('./storeMgr')

const client = new Discord.Client()
const storeMgr = new StoreMgr()

const DISCORD_SERVER_ERROR = 'Whoops... we had an internal issue'
const DISCORD_CHALLENGE_SUCCESS = 'Great! Your challenge code is: '
const DISCORD_INVALID_DID =
  "Oops! That doesn't look right. It looks like this: `z6MkkyAkqY9bPr8gyQGuJTwQvzk8nsfywHCH4jyM1CgTq4KA`"
const DISCORD_REPLY = `Please check your DMs`
const DISCORD_INITIAL_PROMPT = `Hi there! Lets get you verified. Reply with your \`did\`. It look like this: \`z6MkkyAkqY9bPr8gyQGuJTwQvzk8nsfywHCH4jyM1CgTq4KA\``

// TODO: remove and replace with redis code
const API_ENDPOINT =
  'https://r27sfer037.execute-api.us-west-2.amazonaws.com/develop'
// const API_ENDPOINT = "http://localhost:3000";

client.once('ready', async () => {
  console.log('Ready!')
})

client.on('message', async message => {
  if (message.channel.type === 'dm') {
    const { username: handle, discriminator, id: userId } = message.author
    if (handle === '3box-verifications-v2') return
    const username = `${handle}#${discriminator}`

    const { content } = message
    const did = /^[a-zA-z0-9]{48}$/.test(didBody)
    if (!did) return message.channel.send(DISCORD_INVALID_DID)

    const challengeCode = await storeMgr.saveRequest({
      did,
      username: handle,
      userId
    })

    message.channel.send(`${DISCORD_CHALLENGE_SUCCESS} \`${challengeCode}\``)
  } else if (message.content === process.env.INVOCATION_STRING) {
    // console.log(message);
    message.reply(DISCORD_REPLY)
    message.author.send(DISCORD_INITIAL_PROMPT)
  }
})

client.login(process.env.DISCORD_TOKEN)
