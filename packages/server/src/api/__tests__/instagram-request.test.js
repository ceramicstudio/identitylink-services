const InstagramRequestHandler = require('../instagram-request')

describe('InstagramRequestHandler', () => {
  let sut
  let instagramMgrMock = { validateProfileFromAccount: jest.fn() }
  let claimMgrMock = { issue: jest.fn() }
  let analyticsMock = { trackRequestInstagram: jest.fn() }

  beforeAll(() => {
    sut = new InstagramRequestHandler(
      instagramMgrMock,
      claimMgrMock,
      analyticsMock
    )
  })

  test('empty constructor', () => {
    expect(sut).not.toBeUndefined()
  })

  test('no did', done => {
    sut.handle(
      { queryStringParameters: { username: 'anthony' } },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('no did')
        done()
      }
    )
  })

  test('no username', done => {
    sut.handle(
      {
        queryStringParameters: { did: 'did:123' }
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('no username')
        done()
      }
    )
  })

  test('happy path', done => {
    // instagramMgrMock.findDidInGists.mockReturnValue('http://some.valid.url')
    // claimMgrMock.issueInstagram.mockReturnValue('somejwttoken')
    //
    // sut.handle(
    //   {
    //     headers: { origin: 'https://subdomain.3box.io' },
    //     body: JSON.stringify({ did: 'did:https:test', instagram_handle: 'test' })
    //   },
    //   {},
    //   (err, res) => {
    //     expect(err).toBeNull()
    //     expect(res).toEqual({ verification: 'somejwttoken' })
    done()
    //   }
    // )
  })
})
