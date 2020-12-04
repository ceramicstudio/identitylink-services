import AWS from 'aws-sdk'
import MockAWS from 'aws-sdk-mock'
MockAWS.setSDKInstance(AWS)

const apiHandler = require('../api_handler')

describe('apiHandler', () => {
  beforeAll(() => {
    // this keypair is a test one, not a secret really
    let secrets = {
      TWITTER_CONSUMER_KEY: 'FAKE',
      TWITTER_CONSUMER_SECRET: 'FAKE',
      KEYPAIR_PRIVATE_KEY: '4baba8f4a',
      KEYPAIR_PUBLIC_KEY: '04fff936f805ee2',
      GITHUB_USERNAME: 'TEST',
      GITHUB_PERSONAL_ACCESS_TOKEN: 'FAKE'
    }
    MockAWS.mock(
      'KMS',
      'decrypt',
      Promise.resolve({ Plaintext: JSON.stringify(secrets) })
    )
    process.env.SECRETS = secrets
    process.env.IPFS_PATH = '/ipfs'
    process.env.AWS_BUCKET_NAME = 'bucket'
  })

  test('diddoc', done => {
    apiHandler.diddoc({}, {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).not.toBeNull()
      done()
    })
  })

  test('request twitter', done => {
    apiHandler.request_twitter({}, {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).not.toBeNull()
      done()
    })
  })

  test('verify twitter', done => {
    apiHandler.verify_twitter({}, {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).not.toBeNull()
      done()
    })
  })

  test('request github', done => {
    apiHandler.request_github({}, {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).not.toBeNull()
      done()
    })
  })

  test('verify github', done => {
    apiHandler.verify_github({}, {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).not.toBeNull()
      done()
    })
  })
})
