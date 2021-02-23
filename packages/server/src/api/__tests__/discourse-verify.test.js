const DiscourseVerifyHandler = require('../discourse-verify')

describe('DiscourseVerifyHandler', () => {
  let sut
  let discourseMgrMock = { findDidInThread: jest.fn() }
  let claimMgrMock = { issue: jest.fn(), verifyJWS: jest.fn() }
  let analyticsMock = { trackVerifyDiscourse: jest.fn() }

  beforeAll(() => {
    sut = new DiscourseVerifyHandler(discourseMgrMock, claimMgrMock, analyticsMock)
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
    discourseMgrMock.findDidInThread.mockReturnValue({ verification_url: '', username: 'dude' })

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
        expect(err.message).toEqual('no valid post in thread found')
        done()
      }
    )
  })

  test('happy path', done => {
    discourseMgrMock.findDidInThread.mockReturnValue({
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
