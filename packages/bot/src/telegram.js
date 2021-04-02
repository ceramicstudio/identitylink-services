require("dotenv").config();
const botgram = require("botgram")
const bot = botgram(process.env.TELEGRAM_BOT_TOKEN)
const fetch = require("node-fetch");
const StoreMgr = require("./storeMgr");
const storeMgr = new StoreMgr();
const TELEGRAM_CHALLENGE_SUCCESS = "Great! Your challenge code is: ";
const TELEGRAM_INVALID_DID = "Oops! That doesn't look right. It looks like this: `/verify did:key:z6MkkyAkqY9bPr8gyQGuJTwQvzk8nsfywHCH4jyM1CgTq4KA`";
const TELEGRAM_REPLY = `Please check your DMs`;
const TELEGRAM_INITIAL_PROMPT = `Hi there! Lets get you verified. Reply with your did. It should look similar to this example:\n/verify did:key:z6MkkyAkqY9bPr8gyQGuJTwQvzk8nsfywHCH4jyM1CgTq4KA`;

bot.command("help", async (msg, reply) => { reply.text(TELEGRAM_INITIAL_PROMPT)} )

bot.command("verify", async (msg, reply) => {
  console.log(msg);
  let did;
  try {
    did = msg.text.match(/did:key:[a-zA-z0-9]{48}/)[0];
  } catch (e) {
    if (!did) return reply.text(TELEGRAM_INVALID_DID);
  }
  let username = msg.from.username;
  let userId = msg.from.id;
  const challengeCode = await storeMgr.saveRequest({
    did,
    username,
    userId,
  });

  reply.text(`${TELEGRAM_CHALLENGE_SUCCESS} \`${challengeCode}\``);
})

bot.command((msg, reply) =>
  reply.text("Invalid command."))