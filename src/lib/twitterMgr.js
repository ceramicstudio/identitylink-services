const Twit = require('twit')

class TwitterMgr {
    constructor() {
        this.consumer_key = null
        this.consumer_secret = null
        this.access_token = null
        this.access_token_secret = null
        this.client = null
    }

    isSecretsSet() {
        return (this.consumer_key !== null
            || this.consumer_secret !== null
            || this.access_token !== null
            || this.access_token_secret !== null)
    }

    setSecrets(secrets) {
        this.consumer_key = secrets.TWITTER_CONSUMER_KEY;
        this.consumer_secret = secrets.TWITTER_CONSUMER_SECRET
        this.access_token = secrets.TWITTER_ACCESS_TOKEN
        this.access_token_secret = secrets.ACCESS_TOKEN_SECRET

        this.client = new Twit({
            consumer_key: this.consumer_key,
            consumer_secret: this.consumer_secret,
            access_token: this.access_token,
            access_token_secret: this.access_token_secret,
            app_only_auth: true
        })
    }


    async findDidInTweets(handle, did){
        if (!handle) throw new Error("no twitter handle provided")
        if (!did) throw new Error("no did provided")

        let params = {screen_name: handle, tweet_mode: 'extended'}

        return this.client.get('statuses/user_timeline', params)
        .catch( err => {
            console.log('caught error', err.stack)
        })
        .then( res => {
            let status = ''
            res.data.forEach((tweet) => {
                if (tweet.full_text.includes(did)) {
                    status = "https://twitter.com/" + handle + "/status/"
                    status = status + tweet.id_str
                }
            })
            return status
        })
    }

}

module.exports = TwitterMgr;
