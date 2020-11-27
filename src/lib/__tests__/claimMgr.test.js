const ClaimMgr = require('../claimMgr')

describe('ClaimMgr', () => {
  let sut
  let did = 'did:muport:fake'
  let username = '3boxuser'
  let url = 'https://twitter.com/3boxdb/status/1069604129826369537'
  let KEYPAIR_PRIVATE_KEY = 'ouuA7WMw9jpP6qbT4JQ3X1iU5ckLJMdo'
  const KEYPAIR_PUBLIC_KEY =
    '0242659bd61e2bf06485b05be840dbdff8ca2402cad39620a557d4d4815a6b9011'

  let jwtSubstring = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ'

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000
    sut = new ClaimMgr()
  })

  test('empty constructor', () => {
    expect(sut).not.toBeUndefined()
  })

  test('setSecrets', () => {
    expect(sut.isSecretsSet()).toEqual(false)
    sut.setSecrets({
      KEYPAIR_PRIVATE_KEY,
      KEYPAIR_PUBLIC_KEY,
      AWS_BUCKET_NAME: 'bucket'
    })
    expect(sut.isSecretsSet()).toEqual(true)
    expect(sut.signerPrivate).not.toBeUndefined()
  })

  test('issueTwitter() happy path', done => {
    sut
      .issueTwitter(username, did, url)
      .then(resp => {
        expect(resp).toContain(jwtSubstring)
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  })

  test('issueGithub() no did', async done => {
    sut
      .issueGithub(null, username, url)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('No did provided')
        done()
      })
  })
  test('issueGithub() no username', async done => {
    sut
      .issueGithub(did, null, url)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('No username provided')
        done()
      })
  })
  test('issueGithub() no verification_url', async done => {
    sut
      .issueGithub(did, username, null)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('No verification url provided')
        done()
      })
  })

  test('issueGithub() happy path', done => {
    sut
      .issueGithub(username, did, url)
      .then(resp => {
        expect(resp).toContain(jwtSubstring)
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  })
})
