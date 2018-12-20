[![Twitter Follow](https://img.shields.io/twitter/follow/3boxdb.svg?style=for-the-badge&label=Twitter)](https://twitter.com/3boxdb)
[![Discord](https://img.shields.io/discord/484729862368526356.svg?style=for-the-badge)](https://discordapp.com/invite/Z3f3Cxy) [![Greenkeeper badge](https://badges.greenkeeper.io/3box/3box-verifications.svg)](https://greenkeeper.io/)


# 3Box Verification service

# Overview

This service allows to associate a service handle (twitter, github, etc) to a [did](https://w3c-ccg.github.io/did-spec/). It outputs a [did-jwt](https://github.com/uport-project/did-jwt) claim containing a link that serves as proof that the service handle is linked to the did.


# API

## Get DID document

This enables us to use have the issuer DID `did:https:verifications.3box.io` in the claims we create.

**Endpoint:** `GET /.well-known/did.json`

### Response data

```js
{
  "@context": "[https://w3id.org/did/v1](https://w3id.org/did/v1)",
  "id": "did:https:verifications.3box.io",
  "publicKey": [{
    "id": "did:https:verifications.3box.io#owner",
    "type": "Secp256k1VerificationKey2018",
    "owner": "did:https:verifications.3box.io",
    "ethereumAddress": "<ethereum address of private key>"
  }],
  "authentication": [{
    "type": "Secp256k1SignatureAuthentication2018",
    "publicKey": "did:https:verifications.3box.io#owner"
  }]
}
```

## Create twitter verification

**Endpoint:** `POST /twitter`

### Body

```js
{
  did: <the DID of the user>,
  twitter_handle: <the twitter handle of the user>
}
```

### Response

The response data follows the [jsend](https://labs.omniti.com/labs/jsend) standard.

### Response data

```js
{
  status: 'success',
  data: {
    verification: <verification-claim>
  }
}
```

**Verification claim format**

```js
{
  iss: 'did:https:verifications.3box.io',
  sub: <did of the user>,
  iat: <current timestamp in seconds>,
  claim: {
    twitter_handle: <twitter handle of user>,
    twitter_proof: <url of tweet containing users DID>
  }
}
```

## Verify email address

**Endpoint:** `POST /send-email-verification`

This endpoint sends an email to the email address in the body. This email contains the following:
* A code `C` that consists of six randum digits
* The `name` and `image` of the given DID.

Now the DID is saved along with the email address, code `C`, and a timestamp.

### Body

```js
{
  did: <the DID of the user>,
  email_address: <the email address of the user>
}
```

### Response

The response data follows the [jsend](https://labs.omniti.com/labs/jsend) standard.

### Response data

```js
{
  status: 'success'
}
```

**Endpoint:** `POST /email-verify`

This endpoint takes a JWT as an input, which contains the code `C`, and verifies that:
* The JWT signed by the saved DID
* The code `C` in the JWT is the same as the saved code `C`
* The stored timestamp is not older than 12h


### Body

```js
{
  verification: <the input-verification-claim signed by the did of the user>
}
```

**Input verification claim format**

```js
{
  iss: <the users DID>,
  sub: 'did:https:verifications.3box.io',
  iat: <current timestamp in seconds>,
  claim: {
     code: <the 6 digit code>
  }
}
```

**Output verification claim format**

```js
{
  iss: 'did:https:verifications.3box.io',
  sub: <the users DID>,
  iat: <current timestamp in seconds>,
  claim: {
    email_address: <the email address of the user>,
    code: <the 6 digit code>
  }
}
```

### Response

The response data follows the [jsend](https://labs.omniti.com/labs/jsend) standard.

### Response data

```js
{
  status: 'success',
  data: {
    verification: <output-verification-claim>
  }
}
```

## Maintainers
[@simonovic86](https://github.com/simonovic86)
