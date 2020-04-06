const fs = require('fs');
const path = require('path');
const Twitter = require('twitter');
const http = require('http');
const WebSocket = require('ws');
const express = require("express")
const { pool } = require('./config');

const app = express()

// use the express-static middleware
app.use(express.static(path.join(__dirname, 'client/build')))

// cache of data to send to connecting clients
const events = [];
const server = http.createServer(app);

//initialize the WebSocket server instance
const webSocketServer = new WebSocket.Server({ server });

const broadcast = json => {
  webSocketServer.clients.forEach( client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(json));
    }
  });
};

  const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });

if(process.env.DELETE_ALL) {
  pool.query('DELETE from tweets', [], error => {
        if (error) throw error;
      });
}

const excludes = process.env.EXCLUDE ? process.env.EXCLUDE.toUpperCase().split(',') : [];

console.log(`Tracking tweets: ${process.env.TRACK}`);
const stream = client.stream('statuses/filter', {track: process.env.TRACK});
stream.on('data', function(event) {
  if(event.user && event.user.screen_name && !event.retweeted_status) {
    let log = !process.env.TRACK_RT ? !event.retweeted_status : true;

    if(log) {
      // console.log(JSON.stringify(event, null, 2));
      // console.log('***\n\n\n\n');
      const tweetText = event.extended_tweet ? event.extended_tweet.full_text : event.text;
      const tweetTextUpperCase = tweetText.toUpperCase();
      for( let n=0; n < excludes.length; n++) {
        if(tweetTextUpperCase.includes(excludes[n])) {
          // console.log(`Excluded ${tweetText}`);
          log = false;
          break;
        }
      }

      if(log) {
        const tweet = {
          date: event.created_at,
          extraText: tweetText,
          summary: `@${event.user.screen_name}`,
          meta: `Followers: ${event.user.followers_count}` + (event.user.location ? ` from ${event.user.location}` : '')
        };
        events.unshift(tweet);
        events.length = Math.min(100, events.length);
        broadcast(tweet);
  
        if(process.env.LOGDB) {
            pool.query('INSERT INTO tweets (created_at, id_str, screen_name, user_location, user_followers_count, tweet_text, truncated) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
            [event.created_at, event.id_str, event.user.screen_name, event.user.location, event.user.followers_count, tweetText, event.truncated], error => {
            if (error) throw error;
          });
        }
  
        if(process.env.LOG_FILE) {
          fs.appendFile('tweets.csv', `${event.created_at},${event.id_str},${event.user.screen_name},${event.user.location},${event.user.followers_count},${tweetText},${event.truncated}\n`, function (err) {
            if (err) throw err;
          });
        }
        process.stdout.write('.');  
      }
    }
  }
});
 
stream.on('error', function(error) {
  throw error;
});

webSocketServer.on('connection', ws => {
  console.log('Client connected.');
  broadcast(events);
});

// start the server listening for requests
// app.listen(process.env.PORT || 3000, 
//   () => console.log("Server is running..."));


  server.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});
