const DiscourseRequestHandler = require('../discourse-request')

describe('DiscourseRequestHandler', () => {
  let sut
  let discourseMgrMock = { findDidInThread: jest.fn(), saveRequest: jest.fn() }
  let claimMgrMock = { issue: jest.fn() }
  let analyticsMock = { trackRequestDiscourse: jest.fn() }

  beforeAll(() => {
    sut = new DiscourseRequestHandler(discourseMgrMock, claimMgrMock, analyticsMock)
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

  test('no did', done => {
    sut.handle(
      {
        body: JSON.stringify({ other: 'other' })
      },
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
        body: JSON.stringify({ did: 'test' })
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('no discourse username')
        done()
      }
    )
  })

  test('no thread url', done => {
    sut.handle(
      {
        body: JSON.stringify({ did: 'test', username: 'test123123' })
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('no discourse thread url')
        done()
      }
    )
  })

  test('invalid thread url', done => {
    sut.handle(
      {
        body: JSON.stringify({ did: 'test', username: 'test123123', threadUrl: 'abcabc' })
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('invalid discourse thread url')
        done()
      }
    )
  })

  test('valid thread url', done => {
    sut.handle(
      {
        body: JSON.stringify({ did: 'test', username: 'test123123', threadUrl: 'https://meta.discourse.org/t/here-we-see-a-tiny-ux/180686' })
      },
      {},
      (err, res) => {
        expect(res).not.toBeNull()
        expect(res.challengeCode).not.toBeNull()
        done()
      }
    )
  })
})
