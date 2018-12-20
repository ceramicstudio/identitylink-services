class EmailVerifyHandler {
  constructor (emailMgr, claimMgr, analytics) {
    this.name = 'EmailVerifyHandler'
    this.emailMgr = emailMgr
    this.claimMgr = claimMgr
    this.analytics = analytics
  }

  async handle (event, context, cb) {
    let body
    try {
      body = JSON.parse(event.body)
    } catch (e) {
      cb({ code: 400, message: 'no json body: ' + e.toString() })
      return
    }

    if (!body.verification) {
      cb({ code: 403, message: 'no verification' })
      this.analytics.trackVerifyEmail(null, 403)
      return
    }

    let decodedJWT
    let verificationClaim
    let did
    try {
      const verified = await this.claimMgr.verifyToken(body.verification)
      decodedJWT = verified.payload
      did = decodedJWT.iss
      let userCode = decodedJWT.claim.code
      let email = await this.emailMgr.verify(did, userCode)
      if (email) {
        try {
          verificationClaim = await this.claimMgr.issueEmail(did, email, userCode)
        } catch (e) {
          cb({ code: 500, message: 'could not issue a verification claim' })
          this.analytics.trackVerifyEmail(did, 500)
          return
        }
        cb(null, { verification: verificationClaim })
        this.analytics.trackVerifyEmail(did, 200)
      } else {
        cb({ code: 403, message: 'code not found or expired' })
        this.analytics.trackVerifyEmail(did, 403)
        return
      }
    } catch (e) {
      cb({ code: 500, message: 'error while verify the code given by the user' })
      this.analytics.trackVerifyEmail(did, 500)
    }
  }
}
module.exports = EmailVerifyHandler
