import AWS from 'aws-sdk'
import MockAWS from 'aws-sdk-mock'
MockAWS.setSDKInstance(AWS)

const apiHandler = require('../api_handler')

jest.mock('ipfs-s3-dag-get', () => ({
  initIPFS: async () => {
    return 'ipfs'
  }
}))

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

  test('twitter', done => {
    apiHandler.twitter({}, {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).not.toBeNull()
      done()
    })
  })

  test('github', done => {
    apiHandler.github({}, {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).not.toBeNull()
      done()
    })
  })

  test('diddoc', done => {
    apiHandler.diddoc({}, {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).not.toBeNull()
      done()
    })
  })

  test('email_send', done => {
    apiHandler.email_send({}, {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).not.toBeNull()
      done()
    })
  })

  test('email_verify', done => {
    apiHandler.email_verify({}, {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).not.toBeNull()
      done()
    })
  })
})
