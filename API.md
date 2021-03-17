# Overview

This verification service allows users to associate a social account to a Decentralized Identifier (DID). It achieves this though verifying that the user is in control over both the DID and the user account. Once this has been verified, the services issues a [W3C Verifiable Credential](https://github.com/decentralized-identity/did-jwt-vc) with the user' s DID as the subject. The service itself also has a DID which is used to verify the validity of the verifiable credential, where the DID method is a [web-did](https://github.com/decentralized-identity/web-did-resolver).

## Get DID Document

# API

Return a DID Document as specified in the [web-did-resolver](https://github.com/decentralized-identity/web-did-resolver).

**Endpoint:** `GET /.well-known/did.json`

**Response:**

This is just an example, we obviously need to replace the domain and the `publicKeyHex`.

```jsx
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:web:verifications.3boxlabs.com",
  "publicKey": [
    {
      "id": "did:web:verifications.3boxlabs.com#owner",
      "type": "Secp256k1VerificationKey2018",
      "controller": "did:web:verifications.3boxlabs.com",
      "publicKeyHex": "04ab0102bcae6c7c3a90b01a3879d9518081bc06123038488db9cb109b082a77d97ea3373e3dfde0eccd9adbdce11d0302ea5c098dbb0b310234c8689501749274"
    }
  ],
  "authentication": [
    {
      "type": "Secp256k1SignatureAuthentication2018",
      "publicKey": "did:web:verifications.3boxlabs.com#owner"
    }
  ]
}
```

## Request Github Verification

When this request is made the service stores the `did`, `username`, and a *`timestamp`* in it's database of requested github verifications.

**Endpoint:** `POST /api/v0/request-github`

**Body:**

```jsx
{
	did: <user-DID>,
  username: <github-username>
}
```

**Response:**

```jsx
{
  status: 'success',
  data: {
    challenge: <challenge-code>
  }
}
```

## Confirm Github Verification

When this request is recieved the service does the following:

1. Validate that the JWS has a correct signature (is signed by the DID in the `kid` property of the JWS)
2. Retrieve the stored request from the database using the DID part of the `kid` if present, otherwise respond with an error
3. Verify that the *`timestamp`* is from less than 30 minutes ago
4. Verify that the JWS has content equal to the `challenge-code`, otherwise return error
5. Verify that the stored github username has a gist which contains the DID
6. Create a Verifiable Credential with the content described below, sign it with the service key (web-did), and send this as the response

**Endpoint:** `POST /api/v0/confirm-github`

**Body:**

```jsx
{
	jws: <jws-string>
}
```

**Response:**

```jsx
{
  status: 'success',
  data: {
    attestation: <did-jwt-vc-string>
  }
}
```

**Verifiable Credential content:**

```jsx
{
  sub: <user-DID>,
  nbf: 1562950282, // Time jwt was issued
  vc: {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    credentialSubject: {
      account: {
        type: 'Github',
				username: <github-username>,
        url: <url-to-gist-containing-DID>
      }
    }
  }
}
```

## Request Twitter Verification

When this request is made the service stores the `did`, `username`, and a *`timestamp`* in it's database of requested twitter verifications.

**Endpoint:** `POST /api/v0/request-twitter`

**Body:**

```jsx
{
	did: <user-DID>,
  username: <twitter-username>
}
```

**Response:**

```jsx
{
  status: 'success',
  data: {
    challenge: <challenge-code>
  }
}
```

## Confirm Twitter Verification

When this request is recieved the service does the following:

1. Validate that the JWS has a correct signature (is signed by the DID in the `kid` property of the JWS)
2. Retrieve the stored request from the database using the DID part of the `kid` if present, otherwise respond with an error
3. Verify that the *`timestamp`* is from less than 30 minutes ago
4. Verify that the JWS has content equal to the `challenge-code`, otherwise return error
5. Verify that the stored twitter username has a tweet which contains the DID
6. Create a Verifiable Credential with the content described below, sign it with the service key (web-did), and send this as the response

**Endpoint:** `POST /api/v0/confirm-twitter`

**Body:**

```jsx
{
	jws: <jws-string>
}
```

**Response:**

```jsx
{
  status: 'success',
  data: {
    attestation: <did-jwt-vc-string>
  }
}
```

**Verifiable Credential content:**

```jsx
{
  sub: <user-DID>,
  nbf: 1562950282, // Time jwt was issued
  vc: {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    credentialSubject: {
      account: {
        type: 'Twitter',
				username: <twitter-username>,
        url: <url-to-tweet-containing-DID>
      }
    }
  }
}
```

## Request Discord Verification

When this request is made the service stores the `did`, `username`, `verified=false`, and a *`timestamp`* in it's database of requested discord verifications.

Then it triggers a discord bot to send a PM to the given username requesting that they respond with their DID. Once the user responds the service checks if the response matches the `did` stored in the database, if so it sets `verified` to true.

**Endpoint:** `POST /api/v0/request-discord`

**Body:**

```jsx
{
	did: <user-DID>,
  username: <discord-username>
}
```

**Response:**

```jsx
{
  status: 'success',
  data: {
    challenge: <challenge-code>
  }
}
```

## Confirm Discord Verification

When this request is recieved the service does the following:

1. Validate that the JWS has a correct signature (is signed by the DID in the `kid` property of the JWS)
2. Retrieve the stored request from the database using the DID part of the `kid` if present, otherwise respond with an error
3. Verify that the *`timestamp`* is from less than 30 minutes ago
4. Verify that the JWS has content equal to the `challenge-code`, otherwise return error
5. Verify that `verified` is true, otherwise return error
6. Create a Verifiable Credential with the content described below, sign it with the service key (web-did), and send this as the response

**Endpoint:** `POST /api/v0/confirm-discord`

**Body:**

```jsx
{
	jws: <jws-string>
}
```

**Response:**

```jsx
{
  status: 'success',
  data: {
    attestation: <did-jwt-vc-string>
  }
}
```

**Verifiable Credential content:**

```jsx
{
  sub: <user-DID>,
  nbf: 1562950282, // Time jwt was issued
  vc: {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    credentialSubject: {
      account: {
        type: 'Discord',
				username: <discord-username>,
				id: <the-users-id-on-discord>
      }
    }
  }
}
```

## Request Discourse Verification

When this request is made the service stores the `did`, `username`, `threadUrl`, and a *`timestamp`* in it's database of requested discourse verifications.

**Endpoint:** `POST /api/v0/request-discourse`

**Body:**

```jsx
{
  did: <user-DID>,
  threadUrl: <discourse-thread-url>,
  username: <discourse-username>
}
```

**Response:**

```jsx
{
  status: 'success',
  data: {
    challenge: <challenge-code>
  }
}
```

## Confirm Discourse Verification

When this request is recieved the service does the following:

1. Validate that the JWS has a correct signature (is signed by the DID in the `kid` property of the JWS)
2. Retrieve the stored request from the database using the DID part of the `kid` if present, otherwise respond with an error
3. Verify that the *`timestamp`* is from less than 30 minutes ago
4. Verify that the JWS has content equal to the `challenge-code`, otherwise return error
5. Verify that the stored discourse username has a post which contains the DID under the given threadUrl
6. Create a Verifiable Credential with the content described below, sign it with the service key (web-did), and send this as the response

**Endpoint:** `POST /api/v0/confirm-discourse`

**Body:**

```jsx
{
	jws: <jws-string>
}
```

**Response:**

```jsx
{
  status: 'success',
  data: {
    attestation: <did-jwt-vc-string>
  }
}
```

**Verifiable Credential content:**

```jsx
{
  sub: <user-DID>,
  nbf: 1562950282, // Time jwt was issued
  vc: {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    credentialSubject: {
      account: {
        type: 'Discourse',
        username: <discourse-username>,
        url: <url-to-thread-containing-DID>
      }
    }
  }
}
```


## Request Instagram Verification

When this request is made the service stores the `did`, `username`, and a *`timestamp`* in it's database of requested instagram verifications.

Note: due to the OAuth Authorization code flow, the service can provide a convenient HTTP redirection 307 to user by setting the env variable `INSTAGRAM_HTTP_REDIRECT=true`

**Endpoint:** `GET /api/v0/request-instagram`

**Query params:**

```jsx
  - did: <user-DID>
  - username: <instagram-username>
```

Example `/api/v0/request-instagram?username=<instagram-username>&did=<user-DID>`

**Response:**

With `INSTAGRAM_HTTP_REDIRECT=true`, a redirection to [Instagram Authorization Window](https://developers.facebook.com/docs/instagram-basic-display-api/overview/#authorization-window).

Otherwise:

```jsx
{
    "status": "success",
    "data": {
        "statusCode": 307,
        "headers": {
            "Location": "https://api.instagram.com/oauth/authorize/?client_id=<INSTAGRAM_CLIENT_ID>&redirect_uri=<INSTAGRAM_REDIRECT_URI>&scope=user_profile&response_type=code&state=<challenge-code>"
        },
        "body": ""
    }
}
```

## Confirm Instagram Verification

When this request is received the service does the following:

1. Validate that the JWS has a correct signature (is signed by the DID in the `kid` property of the JWS)
2. Retrieve the stored request from the database using the DID part of the `kid` if present, otherwise respond with an error
3. Verify that the JWS has content equal to the `challenge-code`, otherwise return error
4. Verify that the *`timestamp`* is from less than 30 minutes ago
5. Call Instagram OAuth API to convert Authorization code to Oauth access token
6. Get Instagram User profile from the Graph API (`/me`) with the previous access token and
7. Verify that the username from Instagram authenticated response is equal to the stored one.
8. Create a Verifiable Credential with the content described below, sign it with the service key (web-did), and send this as the response

**Endpoint:** `POST /api/v0/confirm-instagram`

**Body:**

```jsx
{
  code: <code-query-param-string>
  jws: <jws-string>
}
```

**Response:**

```jsx
{
  status: 'success',
  data: {
    attestation: <did-jwt-vc-string>
  }
}
```

**Verifiable Credential content:**

```jsx
{
  sub: <user-DID>,
  nbf: 1562950282, // Time jwt was issued
  vc: {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    credentialSubject: {
      account: {
        type: 'Instagram',
        username: <instagram-username>,
        userId: <instagram-userid>
      }
    }
  }
}
```

# User flows

These user flows describe high level user interactions needed to facilitate the verifications. They are mainly meant to illustrate the rough flow so that individual steps that happen in the background can be more easily understood, which is useful if you just want to write a simple test that validates that the services work. The actual user facing implementation can have more optimized UX (e.g. automatically populating a tweet).

## Github verification

1. User inputs their github username and clicks verify
   1. A request with users DID and github username is made to the *request github* endpoint
   2. The returned *challenge code* is temporarily stored
2. User is presented with a text snippet that they copy and use to create a public gist, this text contains their DID
3. User clicks verify and they now get the Verifiable credential back from the service
   1. A JWS containing the *challenge code* is created using the js-did library
   2. The JWS is sent to the *confirm github* endpoint and the Verifiable Credential is returned

## Twitter verification

1. User inputs their twitter username and clicks verify
   1. A request with users DID and twitter username is made to the *request twitter* endpoint
   2. The returned *challenge code* is temporarily stored
2. User is presented with a text snippet that they copy and use to create a tweet, this text contains their DID
3. User clicks verify and they now get the Verifiable credential back from the service
   1. A JWS containing the *challenge code* is created using the js-did library
   2. The JWS is sent to the *confirm twitter* endpoint and the Verifiable Credential is returned

## Discord verification

1. User inputs their discord username and clicks verify
   1. A request with users DID and discord username is made to the *request discord* endpoint
   2. The returned *challenge code* is temporarily stored
   3. User get's a discord PM from a bot requesting them to send their DID
2. User is presented with a text snippet that they copy and use to reply to the bot, this text contains their DID
3. User clicks verify and they now get the Verifiable credential back from the service
   1. A JWS containing the *challenge code* is created using the js-did library
   2. The JWS is sent to the *confirm twitter* endpoint and the Verifiable Credential is returned

## Discourse verification

1. User inputs their discourse username and thread (topic) url that will contain their post which will include the DID and click verify
   1. A request with users DID, thread url and discourse username is made to the *request discourse* endpoint
   2. The returned *challenge code* is temporarily stored
2. User is presented with a text snippet that they copy and use to post in the thread they provided in the first step
3. User clicks verify and they now get the Verifiable credential back from the service
   1. A JWS containing the *challenge code* is created using the js-did library
   2. The JWS is sent to the *confirm discourse* endpoint and the Verifiable Credential is returned

## Instagram verification

1. User inputs their instagram username and clicks verify
   1. A request with users DID, instagram username is made to the *request instagram* endpoint
   2. The returned *challenge code* is temporarily stored
2. User is redirected to [Instagram Authorization window](https://developers.facebook.com/docs/instagram-basic-display-api/overview/#authorization-window) on Instagram's website to login (if not already logged-in) and approve the request of information access.
This can be done by an HTTP redirect if `INSTAGRAM_HTTP_REDIRECT` env var is set or by the verification website.
3. Instagram Auth API redirects to the `INSTAGRAM_REDIRECT_URI` specified in .env and the Instagram Client App settings. The redirection is done with an OAuth2 authorization `code` in query param and `state` containing the *challenge code*.
4. User clicks verify and they now get the Verifiable credential back from the service
   1. A JWS containing the *challenge code* is created using the js-did library
   2. The JWS and the OAuth2 authorization code are sent to the *confirm isntagram* endpoint and the Verifiable Credential is returned

# Implementation details

Here is a few details that will help with the implementation and in particular related to the DID and JWS stuff. Note that some of these are new libraries so definitely reach out if something seems off!

## Client side DID and JWS creation

To create a DID to test with you should use the [key-did-provider-ed25519](https://github.com/ceramicnetwork/key-did-provider-ed25519) together with [js-did](https://github.com/ceramicnetwork/js-did). 

### Create a DID and log it

```tsx
import { randomBytes } from '@stablelib/random'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'

const seed = randomBytes(32)
const provider = new Ed25519Provider(seed)
const did = new DID({ provider })
await did.authenticate()

// log the DID
console.log(did.id)
```

### Sign a JWS

Using the DID instance from above

```tsx
// create JWS
const jws = did.createJWS({ hello: 'world' })
console.log(jws)
```

## Serverside JWS verification

Here we need to use the  [js-did](https://github.com/ceramicnetwork/js-did) and make sure it got the correct DID resolvers configured. A DID resolver is needed in order to get the DID document of a given DID. In our test case we are manly using `did:key`. However in the final version of the service we need to support `did:3` (more on that later, as it's not needed to get going).

```tsx
import { DID } from 'dids'
import KeyResolver from '@ceramicnetwork/key-did-resolver'

const did = new DID({ resolver: { registry: KeyResolver.getResolver() } })

const jws = // jws from request

await did.verifyJWS(jws) // will throw if the jws is incorrect
```

### Setting up a 3ID resolver

The 3ID resolver requires access to the ceramicApi, but other than that it should be fairly straight forward to use. No need to set this up until you've got all of the flows working with the key-did.

Note that the public gateway is not deployed yet.

```tsx
import Ceramic from '@ceramicnetwork/http-client'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'

const ceramic = new Ceramic(<url-of-ceramic-gateway>)

const registry = { 
	...ThreeIdResolver.getResolver(), 
	...KeyResolver.getResolver()
}
const did = new DID({ resolver: { registry } })
```
