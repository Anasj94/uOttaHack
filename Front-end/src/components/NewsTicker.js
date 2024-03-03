import React, { Component } from 'react';
import './NewsTicker.css'; // You'll need to create this CSS file for styling
import Messaging from './Messaging'; // Import your Messaging module

class NewsTicker extends Component {
  state = {
    newsItems: [], // Initialize with an empty array
    currentIndex: 0,
  };

  componentDidMount() {
    // Register the component as a callback with the Messaging module
    Messaging.register(this.handleMessage);

    // Start the ticker
    this.startTicker();
  }

  componentWillUnmount() {
    // Stop the ticker when the component is unmounted
    clearInterval(this.tickerInterval);
  }

  startTicker = () => {
    // Set up a timer to move the ticker
    this.tickerInterval = setInterval(() => {
      // Update the current index
      this.setState((prevState) => ({
        currentIndex:
          prevState.currentIndex === prevState.newsItems.length - 1
            ? 0
            : prevState.currentIndex + 1,
      }));
    }, 2000); // Adjust the interval as needed (in milliseconds)
  };

  handleMessage = (message) => {
    // Handle incoming message from MQTT
    const newValue = message.payloadString;
    this.updateNewsItems(newValue);
  };

  updateNewsItems = (newValue) => {
    // Update news items received from MQTT message
    this.setState({
      newsItems: [...this.state.newsItems, newValue], // Append the new value to existing news items
    });
  };

  render() {
    const { newsItems, currentIndex } = this.state;

    return (
      <div className="news-ticker-container">
        <div className="news-ticker">
          {newsItems.map((item, index) => (
            <div
              key={index}
              className={
                index === currentIndex ? 'news-item active' : 'news-item'
              }
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default NewsTicker;
