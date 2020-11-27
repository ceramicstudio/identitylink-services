const GithubMgr = require('../githubMgr')

describe('GithubMgr', () => {
  let sut
  const DID = 'did:key:z6MkkyAkqY9bPr8gyQGuJTwQvzk8nsfywHCH4jyM1CgTq4KA'
  const GITHUB_USERNAME = 'pi0neerpat'
  const CHALLENGE_CODE = '123'
  const GIST =
    'https://gist.githubusercontent.com/pi0neerpat/271bf248f70895705bd580af39e12247/raw/569fae2ce5f1b4a7605e98a3f246a67fc8291878/gistfile1.txt'

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000
    sut = new GithubMgr()
  })

  test('empty constructor', () => {
    expect(sut).not.toBeUndefined()
  })

  test('setSecrets', () => {
    expect(sut.isSecretsSet()).toEqual(false)
    sut.setSecrets({
      GITHUB_USERNAME
      // Uncomment to test with your real token
      // GITHUB_PERSONAL_ACCESS_TOKEN: 'FAKE'
    })
    expect(sut.isSecretsSet()).toEqual(true)
  })

  test('client authenticated', done => {
    sut.client('GET /users/octocat/orgs').then(res => {
      console.log(`Rate limit: ${res.headers['x-ratelimit-limit']}`)
      done()
    })
  })

  test('saveRequest() happy case', done => {
    sut.store.write = jest.fn()
    sut.store.quit = jest.fn()
    sut
      .saveRequest(GITHUB_USERNAME, DID)
      .then(resp => {
        expect(/[a-zA-Z0-9]{32}/.test(resp)).toBe(true)
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  })

  test('findDidInGists() no did', done => {
    sut
      .findDidInGists(null, CHALLENGE_CODE)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('no did provided')
        done()
      })
  })
  test('findDidInGists() no challengeCode', done => {
    sut
      .findDidInGists(DID, null)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('no challengeCode provided')
        done()
      })
  })

  test('findDidInGists() did not found', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: GITHUB_USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE
    }))
    sut.client = jest.fn(() => {
      return Promise.resolve({ data: [] })
    })

    sut
      .findDidInGists(DID, CHALLENGE_CODE)
      .then(resp => {
        expect(resp).toEqual('')
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
      username: GITHUB_USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE
    }))
    sut.client = jest.fn(() => {
      return Promise.resolve({ data: [] })
    })

    sut
      .findDidInGists(DID, 'incorrect challenge code')
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('Challenge Code is incorrect')
        done()
      })
  })

  test('findDidInGists() Challenge created over 30min ago', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: GITHUB_USERNAME,
      timestamp: Date.now() - 31 * 60 * 1000,
      challengeCode: CHALLENGE_CODE
    }))
    sut
      .findDidInGists(DID, CHALLENGE_CODE)
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

  test('findDidInGists() happy case', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: GITHUB_USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE
    }))
    sut.client = jest.fn(() => {
      return Promise.resolve({
        data: [
          {
            files: {
              'textGist1.txt': {
                raw_url: GIST
              }
            }
          }
        ]
      })
    })

    sut
      .findDidInGists(DID, CHALLENGE_CODE)
      .then(resp => {
        expect(resp.verification_url).toEqual(GIST)
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  })
})
