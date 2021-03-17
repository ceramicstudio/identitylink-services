<h1 align="center">Welcome to identitylink-services-server 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

> A decentralized identifier (DID) verification service for Ceramic. Available methods include Twitter, Discord, Instagram and Github.

## Install

```sh
yarn install
```

Copy `.template.env` to `.env` and update the variables. You'll need the following:

- `VERIFICATION_ISSUER_DOMAIN` - The issuer domain for the claim. For example, if you enter `verifications.3box.io`, the claim issuer will be `did:web:verifications.3box.io`.
- Private key for your `did-jwt` signer
- Ceramic client url to resolve `@ceramicnetwork/3id-did-resolver`
- Twitter developer tokens (you need all 4 items)
- Github account username & API token. "Account Settings" > "Developer settings" > "Personal access tokens"
- Instagram app id & secret from [Facebook Apps](https://developers.facebook.com/apps/) and a registered redirect URI
- Redis database URL & password
- (optional) Segment token

## Test

Run jest

```bash
yarn test
```

You can also test against real-world data. You will need a recent (<30m) Tweet & Gist containing a `did`. See `packages/utils` for a real-world data test suite and other useful scripts.

```bash
sls offline --host 0.0.0.0
```

## Deploy

```bash
# Load your AWS credentials

sls deploy
```

## Notes

#### Different flow for Discord

The Discord service differs from the flows for Twitter and Github. There is no `request-discord` endpoint for the service. Instead, the bot performs the same steps by creating the challenge code, and saving the user's details + challenge to the database. After the `request` step, the bot is no longer needed, and no more connections with Discord are made. In other words we prove ownership of the user's Discord account in the `request` step, rather than in the `verify` step.

## Author

👤 **Patrick Gallagher**

- Website: https://patrickgallagher.dev
  - Twitter: [@pi0neerpat](https://twitter.com/pi0neerpat)
  - GitHub: [@pi0neerpat](https://github.com/pi0neerpat)

## Show your support

Give a ⭐️ if this project helped you!

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
