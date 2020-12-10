const DiscordMgr = require('../discordMgr')

describe('DiscordMgr', () => {
  let sut
  let USERNAME = '381135787330109441'
  const CHALLENGE_CODE = '123'
  const FAKE_DID = 'did:key:z6MkkyAkqY9bPr8gyQGuJTwQvzk8nsfywHCH4jyM1CgTq4KA'

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
    sut = new DiscordMgr()
  })

  test('empty constructor', () => {
    expect(sut).not.toBeUndefined()
  })

  test('setSecrets', () => {
    expect(sut.isSecretsSet()).toEqual(false)
    sut.setSecrets({ REDIS_URL: '123', REDIS_PASSWORD: 'abc' })
    expect(sut.isSecretsSet()).toEqual(true)
    expect(sut.store).not.toBeUndefined()
  })

  test('confirmRequest() no did', done => {
    sut
      .confirmRequest(null, CHALLENGE_CODE)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('no did provided')
        done()
      })
  })
  test('confirmRequest() no challengeCode', done => {
    sut
      .confirmRequest(FAKE_DID, null)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('no challengeCode provided')
        done()
      })
  })

  test.skip('confirmRequest() did not found', done => {
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
      .confirmRequest(FAKE_DID, CHALLENGE_CODE)
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

  test.skip('confirmRequest() incorrect challenge code', done => {
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
      .confirmRequest(FAKE_DID, 'incorrect challenge code')
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('Challenge Code is incorrect')
        done()
      })
  })

  test.skip('confirmRequest() Challenge created over 30min ago', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now() - 31 * 60 * 1000,
      challengeCode: CHALLENGE_CODE
    }))
    sut
      .confirmRequest(FAKE_DID, CHALLENGE_CODE)
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

  test.skip('confirmRequest() did found', done => {
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
      .confirmRequest(FAKE_DID, CHALLENGE_CODE)
      .then(resp => {
        expect(resp).toEqual({
          verification_url: FAKE_TWEET,
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
