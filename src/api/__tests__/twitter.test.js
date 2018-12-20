const TwitterHandler = require('../twitter')

describe('TwitterHandler', () => {
  let sut
  let twitterMgrMock = {
    findDidInTweets: jest.fn()
  }
  let claimMgrMock = {
    issueTwitter: jest.fn()
  }

  beforeAll(() => {
    sut = new TwitterHandler(twitterMgrMock, claimMgrMock)
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

  test('not coming from the 3box origin', done => {
    sut.handle({ headers: { origin: 'abc' }, body: '{}' }, {}, (err, res) => {
      expect(err).not.toBeNull()
      expect(err.message).toEqual('unauthorized')
      expect(err.code).toEqual(401)
      done()
    })
  })

  test('no did', done => {
    sut.handle(
      { headers: { origin: 'https://subdomain.3box.io' }, body: JSON.stringify({ other: 'other' }) },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(403)
        expect(err.message).toEqual('no did')
        done()
      }
    )
  })

  test('no twitter handle', done => {
    sut.handle(
      {
        headers: { origin: 'https://3box.io' },
        body: JSON.stringify({ did: 'did:https:test' }) },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('no twitter handle')
        done()
      }
    )
  })

  test('no verification url', done => {
    twitterMgrMock.findDidInTweets.mockReturnValue('')

    sut.handle(
      {
        headers: { origin: 'https://3box.io' },
        body: JSON.stringify({ did: 'did:https:test', twitter_handle: 'test' })
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('no valid proof available')
        done()
      }
    )
  })

  test('happy path', done => {
    twitterMgrMock.findDidInTweets.mockReturnValue('http://some.valid.url')
    claimMgrMock.issueTwitter.mockReturnValue('somejwttoken')

    sut.handle(
      {
        headers: { origin: 'https://subdomain.3box.io' },
        body: JSON.stringify({ did: 'did:https:test', twitter_handle: 'test' })
      },
      {},
      (err, res) => {
        expect(err).toBeNull()
        expect(res).toEqual({ verification: 'somejwttoken' })
        done()
      }
    )
  })
})
