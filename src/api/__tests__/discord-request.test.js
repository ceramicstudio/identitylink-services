const DiscordRequestHandler = require('../discord-request')

describe('DiscordRequestHandler', () => {
  let sut
  let discordMgrMock = { confirmRequest: jest.fn() }
  let claimMgrMock = { issueDiscord: jest.fn() }
  let analyticsMock = { trackRequestDiscord: jest.fn() }

  beforeAll(() => {
    sut = new DiscordRequestHandler(discordMgrMock, claimMgrMock, analyticsMock)
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

  // TODO: Uncomment for production (if still necessary)
  // test('not coming from the 3box origin', done => {
  //   sut.handle({ headers: { origin: 'abc' }, body: '{}' }, {}, (err, res) => {
  //     expect(err).not.toBeNull()
  //     expect(err.message).toEqual('unauthorized')
  //     expect(err.code).toEqual(401)
  //     done()
  //   })
  // })

  test('no did', done => {
    sut.handle(
      {
        headers: { origin: 'https://subdomain.3box.io' },
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

  test('no discord handle', done => {
    sut.handle(
      {
        headers: { origin: 'https://3box.io' },
        body: JSON.stringify({ did: 'did:https:test' })
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('no discord handle')
        done()
      }
    )
  })

  test('no userId handle', done => {
    sut.handle(
      {
        headers: { origin: 'https://3box.io' },
        body: JSON.stringify({ did: 'did:https:test', username: 'testUser' })
      },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(400)
        expect(err.message).toEqual('no user ID')
        done()
      }
    )
  })

  test('happy path', done => {
    // githubMgrMock.findDidInGists.mockReturnValue('http://some.valid.url')
    // claimMgrMock.issueGithub.mockReturnValue('somejwttoken')
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
