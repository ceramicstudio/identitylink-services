const DiscordMgr = require('../discordMgr')

describe('DiscordMgr', () => {
  let sut
  let USERNAME = 'pi0neerpat'
  const CHALLENGE_CODE = '123'
  const FAKE_DID = 'did:key:z6MkkyAkqY9bPr8gyQGuJTwQvzk8nsfywHCH4jyM1CgTq4KA'
  const USER_ID = '1337'

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

  test('confirmRequest() database entry not found', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({}))
    sut
      .confirmRequest(FAKE_DID, CHALLENGE_CODE)
      .then(resp => {
        fail(`shouldn't return`)
      })
      .catch(err => {
        expect(err.message).toEqual(`No database entry for ${FAKE_DID}`)
        done()
      })
  })

  test('confirmRequest() incorrect challenge code', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE,
      userId: USER_ID
    }))
    sut
      .confirmRequest(FAKE_DID, 'incorect challenge code')
      .then(resp => {
        fail(`shouldn't return`)
      })
      .catch(err => {
        expect(err.message).toEqual('Challenge Code is incorrect')
        done()
      })
  })

  test('confirmRequest() Challenge created over 30min ago', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now() - 31 * 60 * 1000,
      challengeCode: CHALLENGE_CODE,
      userId: USER_ID
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

  test('confirmRequest() happy case', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE,
      userId: USER_ID
    }))
    sut
      .confirmRequest(FAKE_DID, CHALLENGE_CODE)
      .then(resp => {
        const { username, userId } = resp
        expect(username).toEqual(USERNAME)
        expect(userId).toEqual(USER_ID)
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  })
})
