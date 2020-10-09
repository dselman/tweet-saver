# Tweet Saver

This application monitors a Twitter stream for tweets which include keywords. The tweets containing the keywords are then filtered using some exclusion keywords and then persisted into a Postgres database for subsequent offline analysis.

There is also a frontend web-application which may be used to monitor the filtered tweets, displaying them in real-time on a web-page via a websocket connection.

## Database Schema

The file `init.sql` defines the database schema used to persist the Tweets.

## Environment Variables

- TWITTER_CONSUMER_KEY : Twitter API credentials
- TWITTER_CONSUMER_SECRET : Twitter API credentials
- TWITTER_ACCESS_TOKEN_KEY : Twitter API credentials
- TWITTER_ACCESS_TOKEN_SECRET : Twitter API credentials
- TRACK : Keywords to track, passed to Twitter `statuses/filter` API
- TRACK_RT : When true, include retweets
- EXCLUDE : A comma seperated list of words. If any of these words appear in a Tweet it is excluded
- DELETE_ALL : *WARNING!* when true all existing database data is deleted
- LOGDB : When true Tweets are stored in the database
- LOG_FILE : When true Tweets are stored in a file
- PORT : Port number used for the HTTP server
