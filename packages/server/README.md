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

> A serverless identifier (DID) verification service for Ceramic. Available methods include Twitter, Discord, and Github.

## Install

```sh
yarn install
```

Copy `.template.env` to `.env` and update the variables. You'll need the following:

- `VERIFICATION_ISSUER_DOMAIN` - The issuer domain for the claim. For example, if you enter `verifications.3box.io`, the claim issuer will be `did:web:verifications.3box.io`.
- Public/Private key for your `did-jwt` signer which can be [generated appropriately](https://github.com/ceramicstudio/identitylink-services/blob/master/packages/utils/scripts/generateKeyPair.js).
- Ceramic client url to resolve `@ceramicnetwork/3id-did-resolver`
- *(optional)* Twitter developer tokens (you need all 4 items to use this)
- *(optional)* Github account username & API token
  - "Account Settings" > "Developer settings" > "Personal access tokens"
- Redis database URL & password
- *(optional)* Segment token

## Test

Run jest

```bash
yarn test
```

You can also test against real-world data. You will need a recent (<30m) Tweet & Gist containing a `did`. See `packages/utils` for a real-world data test suite and other useful scripts.

* `cd packages/utils/`
* `yarn`
* `SLS_DEBUG=* sls offline --host 0.0.0.0`
* `node scripts/generateKey.js`
* *copy generated DID to a new window:*
* `DID=did:key:z6Mks6zvoambxCnoEqK3JoriQv2RTrP4XUedb554R79zutR6`
* `USER=dysbulic`
* `curl http://localhost:3000/api/v0/request-github -d '{ "did": "'$DID'", "username": "'$USER'" }'`
* *paste the returned challenge key into the prompt in the first window*
* *create a gist in the account to be linked containing the IDX DID*
* *paste the JWS into the terminal*
* `JWS=eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3M2enZvYW1ieENub0VxSzNKb3JpUXYyUlRyUDRYVWVkYjU1NFI3OXp1dFI2I3o2TWtzNnp2b2FtYnhDbm9FcUszSm9yaVF2MlJUclA0WFVlZGI1NTRSNzl6dXRSNiJ9.eyJjaGFsbGVuZ2VDb2RlIjoiamxUQjNKb0VkUnBPU1lhWHo5YndCY1hPTzBhUGl0aVYifQ.-aDKR-vlK_YEbZBZ_nHXOHHilU5NUbB7iHZsdV6Yf3HWEIufUTyYKOsPLYSYSdIZjqSpCgZ6i4K7PVeEbxAdDw`
* `curl http://localhost:3000/api/v0/confirm-github -d '{ "jws": "'$JWS'" }'`

## Deploy

Deployment can be handled using the [`serverless` package](https://www.npmjs.com/package/serverless).

```bash
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

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)._
