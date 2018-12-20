const EmailMgr = require('../emailMgr')
const AWS = require('aws-sdk-mock')
const NullStore = require('../store').NullStore

describe('EmailMgr', () => {
  let store
  let sut
  let userEmail
  let userDid
  let userName

  let mockResponse = {
    ResponseMetadata: { RequestId: '6c4b41b4-24c1-11e9-a415-efc225a7e54a' },
    MessageId: '01010168a0230a86-0e8ba89b-3339-4979-a138-d036e959192d-000000'
  }
  AWS.mock('SES', 'sendEmail', function (params, callback) {
    callback(null, mockResponse)
  })

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
    store = new NullStore()
    sut = new EmailMgr(store)
    userEmail = 'mollie@3box.io'
    userDid = 'did:3:sample did'
    userName = 'Mollie the Narwhal'
  })

  test('empty constructor', () => {
    expect(sut).not.toBeUndefined()
  })

  test('sendVerification() no email', () => {
    sut
      .sendVerification()
      .then(resp => {
        fail('shouldn not return')
        done()
      })
      .catch(error => {
        expect(error.message).toEqual('no email')
      })
  })

  test('sendVerification() happy path', async done => {
    sut
      .sendVerification(userEmail, userDid, userName)
      .then(resp => {
        expect(resp).toBeDefined()
        done()
      })
  })

  test('verify() happy path', async done => {
    sut.getStoredCode = jest.fn(() => { return Promise.resolve({ storedCode: 123456, email: 'user@3box.io' }) })
    sut
      .verify(userDid, 123456)
      .then(resp => {
        expect(resp).toBeTruthy()
        done()
      })
  })

  afterAll(() => {
    AWS.restore('SES')
  })
})
