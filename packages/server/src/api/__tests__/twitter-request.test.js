const TwitterRequestHandler = require('../twitter-request')

describe('TwitterRequestHandler', () => {
  let sut
  let discordMgrMock = { findDidInTweets: jest.fn() }
  let claimMgrMock = { issueTwitter: jest.fn() }
  let analyticsMock = { trackRequestTwitter: jest.fn() }

  beforeAll(() => {
    sut = new TwitterRequestHandler(discordMgrMock, claimMgrMock, analyticsMock)
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

  test('no twitter handle', done => {
    sut.handle(
      {
        body: JSON.stringify({ did: 'did:https:test' })
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('no twitter handle')
        done()
      }
    )
  })

  test('happy path', done => {
    // discordMgrMock.findDidInTweets.mockReturnValue('http://some.valid.url')
    // claimMgrMock.issueTwitter.mockReturnValue('somejwttoken')
    //
    // sut.handle(
    //   {
    //     headers: { origin: 'https://subdomain.3box.io' },
    //     body: JSON.stringify({ did: 'did:https:test', github_handle: 'test' })
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
