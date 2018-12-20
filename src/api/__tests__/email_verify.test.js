const EmailVerifyHandler = require('../email_verify')

describe('EmailVerifyHandler', () => {
  let sut
  let goodCode = 123456
  let wrongCode = 654321
  let userDid = 'did:3:xyz'
  let userEmail = 'user@3box.io'
  let sampleInputJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1MjU5Mjc1MTcsImF1ZCI6ImRpZDp1cG9ydDoyb3NuZko0V3k3TEJBbTJuUEJYaXJlMVdmUW43NVJyVjZUcyIsImV4cCI6MTU1NzQ2MzQyMSwibm'
  let sampleOutputJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1MjU5Mjc1MTcsImF1ZCI6'

  let emailMgrMock = {
    verify: jest.fn()
  }
  let claimMgrMock = {
    issueEmail: jest.fn()
  }

  beforeAll(() => {
    sut = new EmailVerifyHandler(emailMgrMock, claimMgrMock)
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

  test('no verification JWT', done => {
    sut.handle(
      { headers: { origin: 'https://subdomain.3box.io' }, body: JSON.stringify({ other: 'other' }) },
      {},
      (err, res) => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual(403)
        expect(err.message).toEqual('no verification')
        done()
      }
    )
  })

  test('code not found', done => {
    let decodedJWT = {
      payload: {
        iss: userDid,
        sub: 'did:https:verifications.3box.io',
        iat: Math.floor(Date.now()/1000),
        claim: {
          code: wrongCode
        }
      }
    }
    sut.claimMgr.verifyToken = jest.fn(() => { return Promise.resolve(decodedJWT) })
    sut.emailMgr.verify = jest.fn(() => { return Promise.resolve(null) })
    sut.handle(
      {
        headers: { origin: 'https://subdomain.3box.io' },
        body: JSON.stringify({ verification: sampleInputJWT })
      },
      {},
      (err, res) => {
        expect(err.message).toEqual('code not found or expired')
        expect(err.code).toEqual(403)
        done()
      }
    )
  })

  test('code found, claim returned', done => {
    let decodedJWT = {
      payload: {
        iss: userDid,
        sub: 'did:https:verifications.3box.io',
        iat: Math.floor(Date.now()/1000),
        claim: {
          code: goodCode
        }
      }
    }
    sut.claimMgr.verifyToken = jest.fn(() => { return Promise.resolve(decodedJWT) })
    sut.emailMgr.verify = jest.fn(() => { return Promise.resolve(userEmail) })
    sut.claimMgr.issueEmail = jest.fn(() => { return Promise.resolve(sampleOutputJWT) })
    sut.handle(
      {
        headers: { origin: 'https://subdomain.3box.io' },
        body: JSON.stringify({ verification: sampleInputJWT })
      },
      {},
      (err, res) => {
        expect(err).toBeNull()
        expect(res).toBeDefined()
        expect(res.verification).toEqual(sampleOutputJWT)
        done()
      }
    )
  })
})
