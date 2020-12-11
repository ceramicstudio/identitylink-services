const DiscordVerifyHandler = require('../discord-verify')

describe('DiscordVerifyHandler', () => {
  let sut
  let discordMgrMock = { confirmRequest: jest.fn() }
  let claimMgrMock = { issue: jest.fn(), verifyJWS: jest.fn() }
  let analyticsMock = { trackVerifyDiscord: jest.fn() }

  beforeAll(() => {
    sut = new DiscordVerifyHandler(discordMgrMock, claimMgrMock, analyticsMock)
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

  test('happy path', done => {
    discordMgrMock.confirmRequest.mockReturnValue({
      userId: '123456789',
      username: 'dude'
    })
    claimMgrMock.verifyJWS.mockReturnValue({
      payload: { challengeCode: '123' },
      did: 'did:123'
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
