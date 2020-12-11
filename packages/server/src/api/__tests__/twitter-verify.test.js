const TwitterVerifyHandler = require('../twitter-verify')

describe('TwitterVerifyHandler', () => {
  let sut
  let twitterMgrMock = { findDidInTweets: jest.fn() }
  let claimMgrMock = { issue: jest.fn(), verifyJWS: jest.fn() }
  let analyticsMock = { trackVerifyTwitter: jest.fn() }

  beforeAll(() => {
    sut = new TwitterVerifyHandler(twitterMgrMock, claimMgrMock, analyticsMock)
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
        body: JSON.stringify({ other: 'other' })
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(403)
        expect(err.message).toEqual('no jws')
        done()
      }
    )
  })

  test('no verification url', done => {
    twitterMgrMock.findDidInTweets.mockReturnValue({ verification_url: '' })
    claimMgrMock.verifyJWS.mockReturnValue({
      payload: { challengeCode: '123' },
      did: 'did:123'
    })

    sut.handle(
      {
        body: JSON.stringify({ jws: 'abc123' })
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        // expect(err.code).toEqual(400)
        expect(err.message).toEqual('no valid tweet found')
        done()
      }
    )
  })

  test('happy path', done => {
    twitterMgrMock.findDidInTweets.mockReturnValue({
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
