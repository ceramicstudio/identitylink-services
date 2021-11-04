const InstagramMgr = require('../instagramMgr')

describe('InstagramMgr', () => {
  let sut
  let USERNAME = 'wallkanda'
  const CHALLENGE_CODE = '123'
  const FAKE_DID = 'did:key:z6MkkyAkqY9bPr8gyQGuJTwQvzk8nsfywHCH4jyM1CgTq4KA'
  const USER_ID = '1337'
  const FAKE_CODE = '1337'

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
    sut = new InstagramMgr()
  })

  test('empty constructor', () => {
    expect(sut).not.toBeUndefined()
  })

  test('setSecrets', () => {
    expect(sut.isSecretsSet()).toEqual(false)
    sut.setSecrets({
      REDIS_URL: '123',
      REDIS_PASSWORD: 'abc',
      INSTAGRAM_CLIENT_ID: '123',
      INSTAGRAM_CLIENT_SECRET: 'secret',
      INSTAGRAM_REDIRECT_URI: 'https://example.com/auth/'
    })
    expect(sut.isSecretsSet()).toEqual(true)
    expect(sut.store).not.toBeUndefined()
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

  test('generateRedirectionUrl()', done => {
    const result = sut.generateRedirectionUrl(1337)
    expect(result).toEqual(
      'https://api.instagram.com/oauth/authorize/?client_id=123&redirect_uri=https://example.com/auth/&scope=user_profile&response_type=code&state=1337'
    )
    done()
  })

  test('validateProfileFromAccount() no did', done => {
    sut
      .validateProfileFromAccount(null, CHALLENGE_CODE, FAKE_CODE)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('no did provided')
        done()
      })
  })

  test('validateProfileFromAccount() no challengeCode', done => {
    sut
      .validateProfileFromAccount(FAKE_DID, null, FAKE_CODE)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('no challengeCode provided')
        done()
      })
  })

  test('validateProfileFromAccount() no authorization code', done => {
    sut
      .validateProfileFromAccount(FAKE_DID, CHALLENGE_CODE, null)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('no authorization code provided')
        done()
      })
  })

  test('validateProfileFromAccount() database entry not found', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({}))
    sut
      .validateProfileFromAccount(FAKE_DID, CHALLENGE_CODE, FAKE_CODE)
      .then(resp => {
        fail(`shouldn't return`)
      })
      .catch(err => {
        expect(err.message).toEqual(`No database entry for ${FAKE_DID}`)
        done()
      })
  })

  test('validateProfileFromAccount() incorrect challenge code', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE,
      userId: USER_ID
    }))
    sut
      .validateProfileFromAccount(
        FAKE_DID,
        'incorect challenge code',
        FAKE_CODE
      )
      .then(resp => {
        fail(`shouldn't return`)
      })
      .catch(err => {
        expect(err.message).toEqual('Challenge Code is incorrect')
        done()
      })
  })

  test('validateProfileFromAccount() Challenge created over 30min ago', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now() - 31 * 60 * 1000,
      challengeCode: CHALLENGE_CODE,
      userId: USER_ID
    }))
    sut
      .validateProfileFromAccount(FAKE_DID, CHALLENGE_CODE, FAKE_CODE)
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

  test('validateProfileFromAccount() bad Authorization code', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE,
      userId: USER_ID
    }))
    sut.client = jest.fn().mockRejectedValue(new Error('Async error'))
    sut
      .validateProfileFromAccount(FAKE_DID, CHALLENGE_CODE, FAKE_CODE)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual(
          'Could not validate user from Instagram. Error: Async error'
        )
        done()
      })
  })

  test('validateProfileFromAccount() bad username returned', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE,
      userId: USER_ID
    }))
    sut.client = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.resolve({
          json: async function () {
            return Promise.resolve({ access_token: '123' })
          }
        })
      })
      .mockImplementationOnce(() => {
        return Promise.resolve({
          json: async function () {
            return Promise.resolve({
              username: 'thisisnottheexpectedusername',
              id: '123'
            })
          }
        })
      })

    sut
      .validateProfileFromAccount(FAKE_DID, CHALLENGE_CODE, FAKE_CODE)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual(
          'Could not validate user from Instagram. Error: Verification made for the wrong username (wallkanda != thisisnottheexpectedusername)'
        )
        done()
      })
  })

  test('validateProfileFromAccount()', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE,
      userId: USER_ID
    }))
    sut.client = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.resolve({
          json: async function () {
            return Promise.resolve({ access_token: '123' })
          }
        })
      })
      .mockImplementationOnce(() => {
        return Promise.resolve({
          json: async function () {
            return Promise.resolve({
              username: USERNAME,
              id: '123'
            })
          }
        })
      })
    sut
      .validateProfileFromAccount(FAKE_DID, CHALLENGE_CODE, FAKE_CODE)
      .then(resp => {
        // console.log(resp)
        expect(resp.username).toEqual(USERNAME)
        expect(resp.id).toEqual('123')
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  })
})
