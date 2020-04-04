const fs = require('fs');
const Twitter = require('twitter');
const { Client } = require('pg')
const client = new Client()

const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });

console.log(`Tracking tweets: ${process.env.TRACK}`);
const stream = client.stream('statuses/filter', {track: process.env.TRACK});
stream.on('data', function(event) {
  if(event.user && event.user.screen_name && !event.retweeted_status) {
    let log = !process.env.TRACK_RT ? !event.retweeted_status : true;

    if(log) {
      // console.log(JSON.stringify(event, null, 2));
      // console.log('***\n\n\n\n');
      pool.query('INSERT INTO tweets (created_at, id_str, screen_name, user_location, user_followers_count, tweet_text, truncated) VALUES ($1, $2)', 
        [event.created_at, event.id_str, event.user.screen_name, event.user.location, event.user.followers_count, event.text, event.truncated], error => {
        if (error) throw error;
      });

      if(process.env.LOG_FILE) {
        fs.appendFile('tweets.csv', `${event.created_at},${event.id_str},${event.user.screen_name},${event.user.location},${event.user.followers_count},${event.text},${event.truncated}\n`, function (err) {
          if (err) throw err;
        });
      }
      process.stdout.write('.');
    }
  }
});
 
stream.on('error', function(error) {
  throw error;
});