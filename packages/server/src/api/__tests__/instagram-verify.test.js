const InstagramVerifyHandler = require('../instagram-verify')

describe('InstagramVerifyHandler', () => {
  let sut
  let instagramMgrMock = { validateProfileFromAccount: jest.fn() }
  let claimMgrMock = { issue: jest.fn(), verifyJWS: jest.fn() }
  let analyticsMock = { trackVerifyInstagram: jest.fn() }

  beforeAll(() => {
    sut = new InstagramVerifyHandler(
      instagramMgrMock,
      claimMgrMock,
      analyticsMock
    )
  })

  test('empty constructor', () => {
    expect(sut).not.toBeUndefined()
  })

  test('no jws', done => {
    sut.handle(
      {
        body: JSON.stringify({ code: '123' })
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

  test('no code', done => {
    sut.handle(
      {
        body: JSON.stringify({ jws: 'abc123' })
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('no code')
        done()
      }
    )
  })

  test('happy path', done => {
    instagramMgrMock.validateProfileFromAccount.mockReturnValue({
      id: '123',
      username: 'onetwothree'
    })
    claimMgrMock.verifyJWS.mockReturnValue({
      payload: { challengeCode: '123' },
      did: 'did:123'
    })
    claimMgrMock.issue.mockReturnValue('somejwttoken')
    sut.handle(
      {
        body: JSON.stringify({ code: 'Azerty123', jws: 'abc123' })
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
