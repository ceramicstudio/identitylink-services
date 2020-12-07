<h1 align="center">Welcome to 3box-did-utils 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://twitter.com/pi0neerpat" target="_blank">
    <img alt="Twitter: pi0neerpat" src="https://img.shields.io/twitter/follow/pi0neerpat.svg?style=social" />
  </a>
</p>

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

> Playground to build + test 3box-verifications-v2

## Install

```sh
yarn install
```

## Usage

The purpose of this repo is to simulate a client which interacts with the `3box-verifications-v2` service. A savvy developer should be able to use the tools (`utils.js`) and tests here to understand how they can implement utilize service in their own application.

The test suite is run against an instance (local or hosted) of [3box-verifications-v2](https://github.com/pi0neerpat/3box-verifications-v2). There are also convenient test scripts provided in `scripts/` which allow for more hands-on testing.

#### Test suite

In order to pass all tests, you'll need to create a tweet & public gist containing the text `did:key:z6MkrhLBfwRkSedFLwQyJtyFB1ypBD557eq5k4hVvLvADREh`. Keep in mind that gists must be less than 30 minutes old, and only the 5 most recent tweets are considered.

You'll also need to update the `API_ENDPOINT`, as well `USERNAME` to reflect your own twitter/github accounts.

```sh
yarn test
```

#### Test scripts

1. Start the prompt

```bash
node scripts/generateDid
```

2. Copy the `did` eg. "did:key:z6Mkq864iaQiS6EaY2mwoYMyuqocbB7FoCxWomZnHR78Bsoz" and publish a tweet/gist containing the did.

3. Use curl to query a `request` endpoint with your `did` and username. See `scripts/example-curl-commands.md` for more examples.

```bash
curl http://localhost:3000/api/v0/request-github -d '{ "did": "did:key:z6MkoTZNAdoB2AXwtiFxkgrAiKxAWARUFDqHq4VrKxk9nWqd", "username": "pi0neerpat" }'
```

4. The response will include a `challengeCode`, which you can paste into the awaiting prompt from step 1, and received a `jws`.

5. Use curl to query a `verify` endpoint with your `jws`. The returned response includes the attestation.

```bash
curl http://localhost:3000/api/v0/confirm-github  -d '{ "jws": "eyJhb......h" }'
```

## Author

👤 **Patrick Gallagher**

- Website: https://patrickgallagher.dev
  - Twitter: [@pi0neerpat](https://twitter.com/pi0neerpat)
  - GitHub: [@pi0neerpat](https://github.com/pi0neerpat)

## Show your support

Give a ⭐️ if this project helped you!

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
