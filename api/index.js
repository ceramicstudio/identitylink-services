const Discord = require('discord.js')
const client = new Discord.Client()

client.once('ready', async () => {
  console.log('Ready!')
  // console.log(await client.users.cache.get('381135787330109441'))
})

client.on('message', async message => {
  // console.log(message)
  if (message.content === '!ping') {
    // send back "Pong." to the channel the message was sent in
    message.channel.send('Pong.')
    client.users.cache.get('381135787330109441').send(`HEYYYYY`)
  }
  if (message.content === '!server') {
    message.channel.send(
      `Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`
    )
  }
})

client.login(process.env.DISCORD_TOKEN)
