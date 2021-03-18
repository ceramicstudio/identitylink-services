const apiHandler = require('../api_handler')

describe('apiHandler', () => {
  beforeAll(() => {
    // this keypair is a test one, not a secret really
    let secrets = {
      TWITTER_CONSUMER_KEY: 'FAKE',
      TWITTER_CONSUMER_SECRET: 'FAKE',
      KEYPAIR_PRIVATE_KEY: '4baba8f4a',
      KEYPAIR_PUBLIC_KEY: '04fff936f805ee2',
      GITHUB_PERSONAL_ACCESS_TOKEN: 'FAKE',
      INSTAGRAM_CLIENT_ID: '123',
      INSTAGRAM_CLIENT_SECRET: 'secret',
      INSTAGRAM_REDIRECT_URI: 'http://my.url'
    }
    process.env.SECRETS = secrets
  })

  test('diddoc', done => {
    apiHandler.diddoc({}, {}, (err, res) => {
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

  test('verify discord', done => {
    apiHandler.verify_discord({}, {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).not.toBeNull()
      done()
    })
  })

  test('request discourse', done => {
    apiHandler.request_discourse({}, {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).not.toBeNull()
      done()
    })
  })

  test('verify discourse', done => {
    apiHandler.verify_discourse({}, {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).not.toBeNull()
      done()
    })
  })

  // FIXME fix the "Error: input is invalid type"
  test.skip('request instagram', done => {
    apiHandler.request_instagram(
      { queryStringParameters: {} },
      {},
      (err, res) => {
        expect(err).toBeNull()
        expect(res).not.toBeNull()
        done()
      }
    )
  })

  test('verify instagram', done => {
    apiHandler.verify_instagram({}, {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).not.toBeNull()
      done()
    })
  })
})
