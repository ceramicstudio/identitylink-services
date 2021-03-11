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

  test('error', done => {
    sut.handle(
      {
        queryStringParameters: {
          error: 'access_denied',
          error_reason: 'user_denied',
          error_description: 'The+user+denied+your+request'
        }
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('error')
        done()
      }
    )
  })

  test('no code', done => {
    sut.handle(
      {
        queryStringParameters: { state: 'did:123,challenge' }
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('no code in query param.')
        done()
      }
    )
  })

  test('no did', done => {
    sut.handle(
      {
        queryStringParameters: { code: '123', state: ',challenge' }
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('no did in query param.')
        done()
      }
    )
  })

  test('no challengeCode', done => {
    sut.handle(
      {
        queryStringParameters: { code: '123', state: 'did:123,' }
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('no challengeCode in query param.')
        done()
      }
    )
  })
})
