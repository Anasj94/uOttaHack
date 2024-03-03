import React, { Component } from 'react';
import './NewsTicker.css'; // You'll need to create this CSS file for styling
import Messaging from './Messaging'; // Import your Messaging module

class NewsTicker extends Component {
  state = {
    latestNews: '', // Initialize with an empty string for the latest news
  };

  componentDidMount() {
    // Register the component as a callback with the Messaging module
    Messaging.register(this.handleMessage);
  }

  componentWillUnmount() {
    // Unregister the component from Messaging module
    Messaging.unregister(this.handleMessage);
  }

  handleMessage = (message) => {
    // Handle incoming message from MQTT
    const newValue = message.payloadString;
    // Update latest news
    this.setState({ latestNews: newValue });
  };

  render() {
    const { latestNews } = this.state;

    return (
      <div className="news-ticker-container">
        <div className="news-ticker">
          <div className="news-item active">{latestNews}</div>
        </div>
      </div>
    );
  }
}

export default NewsTicker;
