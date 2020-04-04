import React, { useState, useEffect } from 'react';
import { Feed, Header, Container } from 'semantic-ui-react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import './App.css';

var host = window.location.origin.replace(/^http/, 'ws');
const client = new W3CWebSocket(host);

function App() {

  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket client connected');
    };
    client.onmessage = (message) => {
      const data = JSON.parse(message.data);

      if(data.length) {
        setTweets(data);
      }
      else {
        setTweets([data].concat(tweets));
      }
    };
  }, [tweets]);

  const body = (tweets && tweets.length > 0) ? <Feed events={tweets} /> : <p>Loading...</p>

  return (
    <div>
      <Container>
        <Header as='h1'>Tweets</Header>
        {body}
      </Container>
    </div>
  );
}

export default App;
