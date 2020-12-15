const GithubVerifyHandler = require('../github-verify')

describe('GithubVerifyHandler', () => {
  let sut
  let githubMgrMock = { findDidInGists: jest.fn() }
  let claimMgrMock = { issue: jest.fn(), verifyJWS: jest.fn() }
  let analyticsMock = { trackVerifyGithub: jest.fn() }

  beforeAll(() => {
    sut = new GithubVerifyHandler(githubMgrMock, claimMgrMock, analyticsMock)
  })

  test('empty constructor', () => {
    expect(sut).not.toBeUndefined()
  })

  test('handle null body', done => {
    sut.handle({}, {}, (err, res) => {
      expect(err).not.toBeNull()
      expect(err.code).toEqual(400)
      expect(err.message).toBeDefined()
      done()
    })
  })

  test('no jws', done => {
    sut.handle(
      {
        headers: { origin: 'https://3box.io' },
        body: JSON.stringify({ did: 'did:https:test' })
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('no jws')
        done()
      }
    )
  })

  test('no verification url', done => {
    githubMgrMock.findDidInGists.mockReturnValue({ verification_url: '' })
    claimMgrMock.verifyJWS.mockReturnValue({
      payload: { challengeCode: '123' },
      did: 'did:123'
    })

    sut.handle(
      {
        headers: { origin: 'https://3box.io' },
        body: JSON.stringify({ jws: 'abc123' })
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        // expect(err.code).toEqual(400)
        expect(err.message).toEqual('no valid gist found')
        done()
      }
    )
  })

  test('happy path', done => {
    githubMgrMock.findDidInGists.mockReturnValue({
      verification_url: 'http://some.valid.url',
      username: 'dude'
    })
    claimMgrMock.issue.mockReturnValue('somejwttoken')

    sut.handle(
      {
        body: JSON.stringify({ jws: 'abc123' })
      },
      {},
      (err, res) => {
        expect(err).toBeNull()
        expect(res).toEqual({ attestation: 'somejwttoken' })
        done()
      }
    )
  })
})
