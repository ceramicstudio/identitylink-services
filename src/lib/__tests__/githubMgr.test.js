const GithubMgr = require('../githubMgr')

describe('TwitterMgr', () => {
  let sut
  let fakeDid = 'did:3:Qmasdfasdf'
  let handle = 'pi0neerpat'
  let gistUrl =
    'https://gist.githubusercontent.com/pi0neerpat/3fa6abf46b077376425e1a4baf9ef63f/raw/562aa87d3e8a166240f18f9522c3a05850535634/gistfile1.txt'

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
    sut = new GithubMgr()
  })

  test('empty constructor', () => {
    expect(sut).not.toBeUndefined()
  })

  test('setSecrets', () => {
    expect(sut.isSecretsSet()).toEqual(false)
    sut.setSecrets({
      GITHUB_USERNAME: 'pi0neerpat'
      // Uncomment to test your real token
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

  test('findDidInGists() no handle', done => {
    sut
      .findDidInGists()
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('no github handle provided')
        done()
      })
  })

  test('findDidInGists() no did', done => {
    sut
      .findDidInGists(handle)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('no did provided')
        done()
      })
  })

  test('findDidInGists() did found', done => {
    sut.client = jest.fn(() => {
      return Promise.resolve({
        data: [
          {
            files: {
              'textGist1.txt': {
                raw_url: gistUrl
              }
            }
          }
        ]
      })
    })

    sut
      .findDidInGists(handle, fakeDid)
      .then(resp => {
        expect(resp).toEqual(gistUrl)
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  })

  test('findDidInGists() did not found', done => {
    sut.client = jest.fn(() => {
      return Promise.resolve({ data: [] })
    })

    sut
      .findDidInGists(handle, fakeDid)
      .then(resp => {
        expect(resp).toEqual('')
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  })
})
