<h1 align="center">Welcome to 3box-verifications-v2 Discord Bot 👋</h1>
<p>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://twitter.com/pi0neerpat" target="_blank">
    <img alt="Twitter: pi0neerpat" src="https://img.shields.io/twitter/follow/pi0neerpat.svg?style=social" />
  </a>
</p>

> A Discord bot which prompts the user to enter their DID, and creates a new challenge for them.

## Whats included

1. **Server** to run the verification service - `packages/server`
2. **Test utility** and example implementation - `packages/test-examples`
3. **Discord bot** w/ docker container - `packages/bot`

## Usage

### Create a new Discord Bot

Create a new application at https://discord.com/developers. Don't worry about naming here.

Now in your app, navigate to "Bot" and create a bot. Choose a username and Icon for your bot here.

Leave "Bot Permissions" alone.

Copy the `TOKEN` which we will need for our node app.

Back in this package, copy `.template.env` to `.env` and add the `TOKEN` you just copied.

### Run the bot locally

```bash
node bot.js
```

### Add the bot to your server

In the Discord Application, in "General Information", copy the `CLIENT ID`. Insert it in this URL, and send it to the server admin.

```
https://discord.com/oauth2/authorize?client_id=<clientID>&scope=bot
```

### Going to Production - Docker

TODO

## Author

👤 **Patrick Gallagher**

- Website: https://patrickgallagher.dev
  - Twitter: [@pi0neerpat](https://twitter.com/pi0neerpat)
  - GitHub: [@pi0neerpat](https://github.com/pi0neerpat)

## Show your support

Give a ⭐️ if this project helped you!

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
