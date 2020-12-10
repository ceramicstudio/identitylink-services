require("dotenv").config();
const Discord = require("discord.js");
const fetch = require("node-fetch");
const client = new Discord.Client();

const DISCORD_SERVER_ERROR = "Whoops... we had an internal issue";
const DISCORD_CHALLENGE_SUCCESS = "Great! Your challenge code is: ";
const DISCORD_INVALID_DID =
  "Oops! That doesn't look right. It looks like this: `z6MkkyAkqY9bPr8gyQGuJTwQvzk8nsfywHCH4jyM1CgTq4KA`";
const DISCORD_REPLY = `Please check your DMs`;
const DISCORD_INITIAL_PROMPT = `Hi there! Lets get you verified. Reply with your \`did\`. It look like this: \`z6MkkyAkqY9bPr8gyQGuJTwQvzk8nsfywHCH4jyM1CgTq4KA\``;
const API_ENDPOINT =
  "https://r27sfer037.execute-api.us-west-2.amazonaws.com/develop";
// const API_ENDPOINT = "http://localhost:3000";

client.once("ready", async () => {
  console.log("Ready!");
});

client.on("message", async message => {
  if (message.channel.type === "dm") {
    const { username: handle, discriminator, id } = message.author;
    if (handle === "3box-verifications-v2") return;
    const username = `${handle}#${discriminator}`;

    const { content: didBody } = message;
    if (!/^[a-zA-z0-9]{48}$/.test(didBody))
      return message.channel.send(DISCORD_INVALID_DID);

    const res = await fetch(`${API_ENDPOINT}/api/v0/request-discord`, {
      method: "POST",
      body: JSON.stringify({
        username,
        did: `did:key:${didBody}`,
        userId: id
      })
    });
    const data = await res.json();
    if (data.status !== "success") {
      console.log(data);
      return message.channel.send(DISCORD_SERVER_ERROR);
    }
    const challengeCode = data.data.challengeCode;
    message.channel.send(`${DISCORD_CHALLENGE_SUCCESS} \`${challengeCode}\``);
  } else if (message.content === "!verify") {
    // console.log(message);
    message.reply(DISCORD_REPLY);
    message.author.send(DISCORD_INITIAL_PROMPT);
  }
});

client.login(process.env.DISCORD_TOKEN);
