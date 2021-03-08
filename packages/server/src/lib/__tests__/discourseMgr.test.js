const DiscourseMgr = require('../discourseMgr')

const discourseValidThread = require('./mocks/discourseValidThread.json')

describe('DiscourseMgr', () => {
  let sut

  const DID = 'ppbhzx45u2seSXUuq2mREn4h3SG'
  const USERNAME = 'jidanni'
  const CHALLENGE_CODE = '123'
  const THREAD_URL = 'https://meta.discourse.org/t/three-dots-become-garbage-can/180680'

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000
    sut = new DiscourseMgr()
  })

  test('empty constructor', () => {
    expect(sut).not.toBeUndefined()
  })

  test('saveRequest() should work', done => {
    sut.store.write = jest.fn()
    sut.store.quit = jest.fn()

    sut
      .saveRequest(USERNAME, DID, THREAD_URL)
      .then(resp => {
        expect(/[a-zA-Z0-9]{32}/.test(resp)).toBe(true)
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  })

  test('findDidInThread() without providing a did', done => {
    sut
      .findDidInThread(null, CHALLENGE_CODE)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('no did provided')
        done()
      })
  })
  test('findDidInThread() without providing a challenge code', done => {
    sut
      .findDidInThread(DID, null)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('no challengeCode provided')
        done()
      })
  })

  test('findDidInThread() when did is not found', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE,
      threadUrl: THREAD_URL
    }))

    sut.client = jest.fn(() => {
      return Promise.resolve({
        json: async function () { return Promise.resolve({ post_stream: { posts: [] } }) }
      })
    })

    sut
      .findDidInThread(DID, CHALLENGE_CODE)
      .then(resp => {
        expect(resp).toEqual({
          verification_url: '',
          username: USERNAME
        })
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  })

  test('findDidInThread() when given an incorrect challenge code', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE,
      threadUrl: THREAD_URL
    }))

    sut.client = jest.fn(() => {
      return Promise.resolve({
        json: async function () { return Promise.resolve({ post_stream: { posts: [] } }) }
      })
    })

    sut
      .findDidInThread(DID, 'incorrect challenge code')
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual('Challenge Code is incorrect')
        done()
      })
  })

  test('findDidInThread() when challenge was created over 30 mins ago', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now() - 31 * 60 * 1000,
      challengeCode: CHALLENGE_CODE,
      threadUrl: THREAD_URL
    }))

    sut
      .findDidInThread(DID, CHALLENGE_CODE)
      .then(resp => {
        fail("shouldn't return")
      })
      .catch(err => {
        expect(err.message).toEqual(
          'The challenge must have been generated within the last 30 minutes'
        )
        done()
      })
  })

  test('findDidInThread() when did successfully found', done => {
    sut.store.quit = jest.fn()
    sut.store.read = jest.fn(() => ({
      username: USERNAME,
      timestamp: Date.now(),
      challengeCode: CHALLENGE_CODE,
      threadUrl: THREAD_URL
    }))

    sut.client = jest.fn(() => {
      return Promise.resolve({
        json: async function () { return Promise.resolve(discourseValidThread) }
      })
    })

    sut
      .findDidInThread(DID, CHALLENGE_CODE)
      .then(resp => {
        expect(resp.verification_url).toEqual(THREAD_URL)
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  })
})
