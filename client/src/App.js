import React, { useState, useEffect } from 'react';
import { Feed, Header, Container } from 'semantic-ui-react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import './App.css';

const client = new W3CWebSocket('ws://127.0.0.1:8000');

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

  console.log(tweets);

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
