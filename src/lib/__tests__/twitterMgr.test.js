const TwitterMgr = require('../twitterMgr')

describe('TwitterMgr', () => {
  let sut
  let USERNAME = 'oedtest'
  const CHALLENGE_CODE = '123'
  const FAKE_DID = 'did:key:z6MkkyAkqY9bPr8gyQGuJTwQvzk8nsfywHCH4jyM1CgTq4KA'
  let statusUrl = 'https://twitter.com/oedtest/status/1078648593987395584'

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
    sut = new TwitterMgr()
  })

  test('empty constructor', () => {
    expect(sut).not.toBeUndefined()
  })

  test('setSecrets', () => {
    expect(sut.isSecretsSet()).toEqual(false)
    sut.setSecrets({
      TWITTER_CONSUMER_KEY: 'FAKE',
      TWITTER_CONSUMER_SECRET: 'FAKE'
    })
    expect(sut.isSecretsSet()).toEqual(true)
    expect(sut.consumer_key).not.toBeUndefined()
  })

  test('client authenticated', done => {
    sut.client.get('application/rate_limit_status', (_err, body, res) => {
      console.log(body)
      done()
    })
  })

  test('saveRequest() happy case', done => {
    sut.store.write = jest.fn()
    sut.store.quit = jest.fn()
    sut
      .saveRequest(USERNAME, FAKE_DID)
      .then(resp => {
        expect(/[a-zA-Z0-9]{32}/.test(resp)).toBe(true)
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  })

  test('findDidInTweets() no did', done => {
    sut
      .findDidInTweets(null, CHALLENGE_CODE)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('no did provided')
        done()
      })
  })
  test('findDidInTweets() no challengeCode', done => {
    sut
      .findDidInTweets(FAKE_DID, null)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('no challengeCode provided')
        done()
      })
  })

  test('findDidInTweets() did not found', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE
    }))
    sut.client.get = jest.fn(() => {
      return Promise.resolve({ data: [] })
    })
    sut
      .findDidInTweets(FAKE_DID, CHALLENGE_CODE)
      .then(resp => {
        expect(resp).toEqual({
          verification_url: '',
          username: USERNAME
        })
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  })

  test('findDidInGists() incorrect challenge code', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE
    }))
    sut.client = jest.fn(() => {
      return Promise.resolve({ data: [] })
    })

    sut
      .findDidInTweets(FAKE_DID, 'incorrect challenge code')
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('Challenge Code is incorrect')
        done()
      })
  })

  test('findDidInTweets() Challenge created over 30min ago', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now() - 31 * 60 * 1000,
      challengeCode: CHALLENGE_CODE
    }))
    sut
      .findDidInTweets(FAKE_DID, CHALLENGE_CODE)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual(
          'The challenge must have been generated within the last 30 minutes'
        )
        done()
      })
  })

  test('findDidInTweets() did found', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE
    }))
    sut.client.get = jest.fn(() => {
      return Promise.resolve({
        data: [
          { full_text: 'my did is ' + FAKE_DID, id_str: '1078648593987395584' }
        ]
      })
    })

    sut
      .findDidInTweets(FAKE_DID, CHALLENGE_CODE)
      .then(resp => {
        expect(resp).toEqual({
          verification_url: statusUrl,
          username: USERNAME
        })
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  })
})
