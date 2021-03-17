const InstagramRequestHandler = require('../instagram-request')

describe('InstagramRequestHandler', () => {
  let sut
  let instagramMgrMock = {
    generateRedirectionUrl: jest.fn(),
    saveRequest: jest.fn()
  }
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

  test('no did nor username', done => {
    sut.handle({}, {}, (err, res) => {
      expect(err).not.toBeNull()
      expect(err.code).toEqual(400)
      expect(err.message).toEqual('no did nor username')
      done()
    })
  })

  test('no did', done => {
    sut.handle(
      { queryStringParameters: { username: 'anthony' } },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(403)
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
    instagramMgrMock.generateRedirectionUrl.mockReturnValue(
      'http://some.valid.url'
    )
    sut.handle(
      {
        queryStringParameters: { username: 'wallkanda', did: 'did:123' }
      },
      {},
      (_err, res) => {
        expect(res).not.toBeNull()
        // console.log(res)
        expect(res.statusCode).toEqual(307)
        expect(res.headers.Location).not.toBeNull()
        done()
      }
    )
  })

  // test('happy path with HTTP redirect', done => {
  //   sut.handle(
  //     {
  //       queryStringParameters: { username: 'wallkanda', did: 'did:123' }
  //     },
  //     {},
  //     (_err, res) => {
  //       expect(res).not.toBeNull()
  //       expect(res.status).toEqual(307)
  //       expect(res.headers.get('Location')).not.toBeNull()
  //       done()
  //     }
  //   )
  // })
})
