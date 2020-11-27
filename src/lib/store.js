const { promisify } = require('util')
const redis = require('redis')
const HOUR12 = 43200

/**
 *  RedisStore Representation. Wrapped redis client. Read, write, and invalidate objects.
 */
class RedisStore {
  constructor(redisOpts = {}, ttl) {
    this.redis = redis.createClient(redisOpts)
    this.redis.on('error', function (err) {
      console.log('Error ' + err)
    })
    this.ttl = ttl || HOUR12
  }

  read(key) {
    const getAsync = promisify(this.redis.get).bind(this.redis)
    return getAsync(key)
      .then(val => JSON.parse(val))
      .catch(console.error)
  }

  write(key, obj) {
    const setAsync = promisify(this.redis.set).bind(this.redis)
    return setAsync(key, JSON.stringify(obj), 'EX', this.ttl).catch(e => {
      console.log(e)
    })
  }

  invalidate(key) {
    this.redis.del(key)
  }

  quit() {
    this.redis.quit()
  }
}

/**
 *  NullStore implements an abstract store interface without caching any
 *  data. Primarly used for testing and development.
 */

class NullStore {
  read(key) {
    return Promise.resolve(null)
  }

  write(key, obj) {}

  invalidate(key) {}

  quit() {}
}

module.exports = { RedisStore, NullStore }
