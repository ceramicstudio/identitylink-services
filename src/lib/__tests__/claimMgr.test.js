const ClaimMgr = require('../claimMgr')

jest.mock('ipfs-s3-dag-get', () => ({
  initIPFS: async () => {
      return 'ipfs'
    }
}))

describe('ClaimMgr', () => {
  let sut
  let did = 'did:muport:fake'
  let handle = '3boxuser'
  let url = 'https://twitter.com/3boxdb/status/1069604129826369537'
  let signerPrivate = 'fa09a3ff0d486be2eb69545c393e2cf47cb53feb44a3550199346bdfa6f53245'
  let jwtSubstring = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ'

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
        sut = new ClaimMgr()
  })

  test('empty constructor', () => {
    expect(sut).not.toBeUndefined()
  })

  test('setSecrets', () => {
    expect(sut.isSecretsSet()).toEqual(false)
    sut.setSecrets({
      KEYPAIR_PRIVATE_KEY: signerPrivate,
      IPFS_PATH: '/ipfs',
      AWS_BUCKET_NAME: 'bucket'
    })
    expect(sut.isSecretsSet()).toEqual(true)
    expect(sut.signerPrivate).not.toBeUndefined()
  })

  test('issueTwitter() happy path', done => {
    sut.issueTwitter(handle, did, url)
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
