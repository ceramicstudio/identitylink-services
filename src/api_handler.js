// eslint-disable-next-line import/prefer-default-export
// const AWS = require('aws-sdk')

const TwitterHandler = require('./api/twitter')
const GithubHandler = require('./api/github')
const EmailSendHandler = require('./api/email_send')
const EmailVerifyHandler = require('./api/email_verify')
const DidDocumentHandler = require('./api/diddoc')

const TwitterMgr = require('./lib/twitterMgr')
const GithubMgr = require('./lib/githubMgr')
const EmailMgr = require('./lib/emailMgr')
const ClaimMgr = require('./lib/claimMgr')
const Analytics = require('./lib/analytics')

let twitterMgr = new TwitterMgr()
let claimMgr = new ClaimMgr()
let emailMgr = new EmailMgr()
let githubMgr = new GithubMgr()
const analytics = new Analytics()

const doHandler = (handler, event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  handler.handle(event, context, (err, resp) => {
    let body = JSON.stringify({})
    if (handler.name === 'DidDocumentHandler') {
      body = JSON.stringify(resp)
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
if (process.env.IPFS_PATH) envConfig['IPFS_PATH'] = process.env.IPFS_PATH
if (process.env.AWS_BUCKET_NAME)
  envConfig['AWS_BUCKET_NAME'] = process.env.AWS_BUCKET_NAME

const preHandler = (handler, event, context, callback) => {
  if (
    // !twitterMgr.isSecretsSet() ||
    !claimMgr.isSecretsSet() ||
    // !emailMgr.isSecretsSet() ||
    // !analytics.isSecretsSet() ||
    !githubMgr.isSecretsSet()
  ) {
    // TODO: Uncomment for 3Box team deployment
    // const kms = new AWS.KMS()
    // kms
    //   .decrypt({ CiphertextBlob: Buffer.from(process.env.SECRETS, 'base64') })
    //   .promise()
    //   .then(data => {
    //     const decrypted = String(data.Plaintext)
    //     const config = Object.assign(JSON.parse(decrypted), envConfig)
    //     twitterMgr.setSecrets(config)
    //     githubMgr.setSecrets(config)
    //     emailMgr.setSecrets(config)
    //     analytics.setSecrets(config)
    //     return claimMgr.setSecrets(config)
    //   })
    //   .then(res => {
    //     doHandler(handler, event, context, callback)
    //   })
    const secretsFromEnv = {
      GITHUB_USERNAME: process.env.GITHUB_USERNAME,
      GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
      KEYPAIR_PRIVATE_KEY: process.env.KEYPAIR_PRIVATE_KEY,
      KEYPAIR_PUBLIC_KEY: process.env.KEYPAIR_PUBLIC_KEY
    }
    const config = { ...secretsFromEnv, ...envConfig }
    githubMgr.setSecrets(config)
    claimMgr.setSecrets(config)
    doHandler(handler, event, context, callback)
  } else {
    doHandler(handler, event, context, callback)
  }
}

let twitterHandler = new TwitterHandler(twitterMgr, claimMgr, analytics)
module.exports.twitter = (event, context, callback) => {
  preHandler(twitterHandler, event, context, callback)
}

let githubHandler = new GithubHandler(githubMgr, claimMgr, analytics)
module.exports.github = (event, context, callback) => {
  preHandler(githubHandler, event, context, callback)
}

let emailSendHandler = new EmailSendHandler(emailMgr, analytics)
module.exports.email_send = (event, context, callback) => {
  preHandler(emailSendHandler, event, context, callback)
}

let emailVerifyHandler = new EmailVerifyHandler(emailMgr, claimMgr, analytics)
module.exports.email_verify = (event, context, callback) => {
  preHandler(emailVerifyHandler, event, context, callback)
}

let didDocumentHandler = new DidDocumentHandler(claimMgr)
module.exports.diddoc = (event, context, callback) => {
  preHandler(didDocumentHandler, event, context, callback)
}
