jest.mock('redis', () => {
  return {
    createClient: jest.fn(() => {
      return {
        on: jest.fn(),
        get: jest.fn((key, fn) => fn(null, '"someVal"')),
        set: jest.fn(),
        del: jest.fn()
      }
    })
  }
})

const { RedisStore } = require('../store')
const TTL = 12345

describe('RedisStore', () => {
  let store

  beforeAll(async () => {
    store = new RedisStore({ host: 'somepath' }, TTL)
  })

  it('should read values correctly', async () => {
    const val = await store.read('test')

    expect(val).toEqual('someVal')
    expect(store.redis.get).toHaveBeenCalledTimes(1)
  })

  it('should write values correctly', async () => {
    await store.write('test', { test: 123 })

    expect(store.redis.set).toHaveBeenCalledTimes(1)
    expect(store.redis.set).toHaveBeenCalledWith('test', JSON.stringify({ test: 123 }), 'EX', TTL)
  })

  it('should write values correctly', async () => {
    await store.invalidate('test')

    expect(store.redis.del).toHaveBeenCalledTimes(1)
    expect(store.redis.del).toHaveBeenCalledWith('test')
  })
})
