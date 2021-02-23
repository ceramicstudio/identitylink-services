class DiscourseRequestHandler {
  constructor(discourseMgr, claimMgr, analytics) {
    this.name = 'DiscourseRequestHandler'
    this.discourseMgr = discourseMgr
    this.claimMgr = claimMgr
    this.analytics = analytics
  }

  async handle(event, _context, cb) {
    let body
    try {
      body = JSON.parse(event.body)
    } catch (e) {
      cb({ code: 400, message: 'no json body: ' + e.toString() })
      return
    }

    if (!body.did) {
      cb({ code: 403, message: 'no did' })
      this.analytics.trackRequestDiscourse(body.did, 403)
      return
    }
    if (!body.username) {
      cb({ code: 400, message: 'no discourse username' })
      this.analytics.trackRequestDiscourse(body.did, 400)
      return
    }
    if (!body.threadUrl) {
      cb({ code: 400, message: 'no discourse thread url' })
      this.analytics.trackRequestDiscourse(body.did, 400)
      return
    }
    if (!body.threadUrl.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/) || !body.threadUrl.includes('/t/')) {
      cb({ code: 400, message: 'invalid discourse thread url' })
      this.analytics.trackRequestDiscourse(body.did, 400)
      return
    }

    let challengeCode = ''
    try {
      challengeCode = await this.discourseMgr.saveRequest(body.username, body.did, body.threadUrl)
    } catch (e) {
      cb({ code: 500, message: 'error while trying save to Redis' })
      this.analytics.trackRequestDiscourse(body.did, 500)
      return
    }

    cb(null, { challengeCode })
    this.analytics.trackRequestDiscourse(body.did, 200)
  }
}
module.exports = DiscourseRequestHandler
