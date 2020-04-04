const fs = require('fs');
const Twitter = require('twitter');
const { pool } = require('./config');

// Generates unique ID for every new connection
const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

const sendMessage = (json) => {
  // We are sending the current data to all connected clients
  Object.keys(clients).map((client) => {
    clients[client].sendUTF(JSON.stringify(json));
  });
}

// I'm maintaining all active connections in this object
const clients = {};
const events = [];

const webSocketsServerPort = 8000;
const webSocketServer = require('websocket').server;
const http = require('http');
// Spinning the http server and the websocket server.
const server = http.createServer();
server.listen(webSocketsServerPort);
const wsServer = new webSocketServer({
  httpServer: server
});

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

console.log(`Tracking tweets: ${process.env.TRACK}`);
const stream = client.stream('statuses/filter', {track: process.env.TRACK});
stream.on('data', function(event) {
  if(event.user && event.user.screen_name && !event.retweeted_status) {
    let log = !process.env.TRACK_RT ? !event.retweeted_status : true;

    if(log) {
      // console.log(JSON.stringify(event, null, 2));
      // console.log('***\n\n\n\n');
      const tweetText = event.extended_tweet ? event.extended_tweet.full_text : event.text;
      const tweet = {
        date: event.created_at,
        extraText: tweetText,
        summary: `@${event.user.screen_name}`,
        meta: `Followers: ${event.user.followers_count}` + (event.user.location ? ` from ${event.user.location}` : '')
      };
      events.unshift(tweet);
      events.length = 100;
      sendMessage(tweet);

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
});
 
stream.on('error', function(error) {
  throw error;
});

wsServer.on('request', function(request) {
  var userID = getUniqueID();
  console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
  // You can rewrite this part of the code to accept only the requests from allowed origin
  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      sendMessage(events);
    }
  });
  // user disconnected
  connection.on('close', function(connection) {
    delete clients[userID];
  });
});