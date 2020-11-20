const SegmentAnalytics = require('analytics-node')
const sha256 = require('js-sha256').sha256

const hash = str =>
  str === null ? null : Buffer.from(sha256.digest(str)).toString('hex')

class Analytics {
  isSecretsSet() {
    return this.client !== null
  }

  setSecrets(secrets) {
    this.writeKey = secrets.SEGMENT_WRITE_KEY
    this.client = this.writeKey ? new SegmentAnalytics(this.writeKey) : null
  }

  _track(data = {}) {
    if (this.client) {
      data.anonymousId = '3box'
      data.properties.time = Date.now()
      return this.client.track(data)
    } else {
      return false
    }
  }

  trackVerifyEmail(did, status) {
    let data = {}
    data.event = 'verify_service_email'
    data.properties = { did_hash: hash(did), status }
    this._track(data)
  }

  trackSendVerifyEmail(did, status) {
    let data = {}
    data.event = 'verify_service_send_email'
    data.properties = { did_hash: hash(did), status }
    this._track(data)
  }

  trackVerifyTwitter(did, status) {
    let data = {}
    data.event = 'verify_service_twitter'
    data.properties = { did_hash: hash(did), status }
    this._track(data)
  }

  trackVerifyGithub(did, status) {
    let data = {}
    data.event = 'verify_service_github'
    data.properties = { did_hash: hash(did), status }
    this._track(data)
  }
}

module.exports = Analytics
