// eslint-disable-next-line import/prefer-default-export
const GithubRequestHandler = require('./api/github-request')
const GithubVerifyHandler = require('./api/github-verify')
const TwitterRequestHandler = require('./api/twitter-request')
const TwitterVerifyHandler = require('./api/twitter-verify')
const DiscordVerifyHandler = require('./api/discord-verify')
const DiscourseRequestHandler = require('./api/discourse-request')
const DiscourseVerifyHandler = require('./api/discourse-verify')
const InstagramRequestHandler = require('./api/instagram-request')
const InstagramVerifyHandler = require('./api/instagram-verify')
const DidDocumentHandler = require('./api/diddoc')

const GithubMgr = require('./lib/githubMgr')
const TwitterMgr = require('./lib/twitterMgr')
const DiscordMgr = require('./lib/discordMgr')
const DiscourseMgr = require('./lib/discourseMgr')
const InstagramMgr = require('./lib/instagramMgr')
const ClaimMgr = require('./lib/claimMgr')
const Analytics = require('./lib/analytics')

let githubMgr = new GithubMgr()
let twitterMgr = new TwitterMgr()
let discordMgr = new DiscordMgr()
let discourseMgr = new DiscourseMgr()
let instagramMgr = new InstagramMgr()
let claimMgr = new ClaimMgr()
const analytics = new Analytics()

const doHandler = (handler, event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  handler.handle(event, context, (err, resp) => {
    let body = JSON.stringify({})
    if (handler.name === 'DidDocumentHandler') {
      body = JSON.stringify(resp)
      // Enable GET redirection for Instagram Oauth2 Authorization code flow
    } else if (
      handler.name === 'InstagramRequestHandler' &&
      process.env.INSTAGRAM_HTTP_REDIRECT
    ) {
      callback(null, resp)
      return
    } else {
      body = JSON.stringify({
        status: 'success',
        data: resp
      })
    }
    let response
    if (err == null) {
      response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: body
      }
    } else {
      let code = 500
      if (err.code) code = err.code
      let message = err
      if (err.message) message = err.message

      response = {
        statusCode: code,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          status: 'error',
          message: message
        })
      }
    }

    callback(null, response)
  })
}

// Allow some env vars to overwrite KMS
const envConfig = {}

const preHandler = (handler, event, context, callback) => {
  if (
    !twitterMgr.isSecretsSet() ||
    !claimMgr.isSecretsSet() ||
    !githubMgr.isSecretsSet() ||
    !discordMgr.isSecretsSet() ||
    !instagramMgr.isSecretsSet()
  ) {
    const secretsFromEnv = {
      VERIFICATION_ISSUER_DOMAIN: process.env.VERIFICATION_ISSUER_DOMAIN,
      KEYPAIR_PRIVATE_KEY: process.env.KEYPAIR_PRIVATE_KEY,
      KEYPAIR_PUBLIC_KEY: process.env.KEYPAIR_PUBLIC_KEY,
      CERAMIC_CLIENT_URL: process.env.CERAMIC_CLIENT_URL,
      REDIS_URL: process.env.REDIS_URL,
      REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
      TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY,
      TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET,
      TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
      TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      INSTAGRAM_CLIENT_ID: process.env.INSTAGRAM_CLIENT_ID,
      INSTAGRAM_CLIENT_SECRET: process.env.INSTAGRAM_CLIENT_SECRET,
      INSTAGRAM_REDIRECT_URI: process.env.INSTAGRAM_REDIRECT_URI,
      SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY
    }
    const config = { ...secretsFromEnv, ...envConfig }
    analytics.setSecrets(config)
    claimMgr.setSecrets(config)
    githubMgr.setSecrets(config)
    twitterMgr.setSecrets(config)
    discordMgr.setSecrets(config)
    discourseMgr.setSecrets(config)
    instagramMgr.setSecrets(config)
    doHandler(handler, event, context, callback)
  } else {
    doHandler(handler, event, context, callback)
  }
}

let didDocumentHandler = new DidDocumentHandler(claimMgr)
module.exports.diddoc = (event, context, callback) => {
  preHandler(didDocumentHandler, event, context, callback)
}

let githubRequestHandler = new GithubRequestHandler(
  githubMgr,
  claimMgr,
  analytics
)

/// /////////////////////
// GITHUB
/// ////////////////////
module.exports.request_github = (event, context, callback) => {
  preHandler(githubRequestHandler, event, context, callback)
}

let githubVerifyHandler = new GithubVerifyHandler(
  githubMgr,
  claimMgr,
  analytics
)
module.exports.verify_github = (event, context, callback) => {
  preHandler(githubVerifyHandler, event, context, callback)
}

/// /////////////////////
// Twitter
/// ////////////////////
let twitterRequestHandler = new TwitterRequestHandler(
  twitterMgr,
  claimMgr,
  analytics
)
module.exports.request_twitter = (event, context, callback) => {
  preHandler(twitterRequestHandler, event, context, callback)
}

let twitterVerifyHandler = new TwitterVerifyHandler(
  twitterMgr,
  claimMgr,
  analytics
)
module.exports.verify_twitter = (event, context, callback) => {
  preHandler(twitterVerifyHandler, event, context, callback)
}

/// /////////////////////
// Discord
/// ////////////////////
let discordVerifyHandler = new DiscordVerifyHandler(
  discordMgr,
  claimMgr,
  analytics
)
module.exports.verify_discord = (event, context, callback) => {
  preHandler(discordVerifyHandler, event, context, callback)
}

/// /////////////////////
// Discourse
/// ////////////////////
let discourseRequestHandler = new DiscourseRequestHandler(
  discourseMgr,
  claimMgr,
  analytics
)

module.exports.request_discourse = (event, context, callback) => {
  preHandler(discourseRequestHandler, event, context, callback)
}

let discourseVerifyHandler = new DiscourseVerifyHandler(
  discourseMgr,
  claimMgr,
  analytics
)
module.exports.verify_discourse = (event, context, callback) => {
  preHandler(discourseVerifyHandler, event, context, callback)
}

/// /////////////////////
// Instagram
/// ////////////////////
let instagramRequestHandler = new InstagramRequestHandler(
  instagramMgr,
  claimMgr,
  analytics
)

module.exports.request_instagram = (event, context, callback) => {
  preHandler(instagramRequestHandler, event, context, callback)
}

let instagramVerifyHandler = new InstagramVerifyHandler(
  instagramMgr,
  claimMgr,
  analytics
)
module.exports.verify_instagram = (event, context, callback) => {
  preHandler(instagramVerifyHandler, event, context, callback)
}
