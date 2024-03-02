import React, { Component } from 'react';
import "./AnimatedDot.css"

class AnimatedDot extends Component {
  state = {
    notified: false // Flag to track whether notification has been triggered
  };

  componentDidMount() {
    // Adjust animation duration based on car speed
    this.adjustDotSpeed(100); // Adjust car speed as needed in km/hr

    // Check proximity and notify periodically (adjust the interval as needed)
    this.proximityInterval = setInterval(() => {
      this.checkProximityAndNotify(50); // Adjust the threshold distance as needed
    }, 1000); // Check every second
  }

  componentWillUnmount() {
    clearInterval(this.proximityInterval);
  }

  adjustDotSpeed(carSpeedKmPerHour) {
    const dotElement = document.getElementById('dot');
    const containerWidth = document.querySelector('.container').clientWidth;
    const dotWidth = dotElement.offsetWidth;
    const distanceToTravel = containerWidth - dotWidth; // Distance to travel

    // Calculate time taken to travel the distance at given speed (in milliseconds)
    const timeTakenInMillis =
      (distanceToTravel / 1000 / (carSpeedKmPerHour / 3600)) * 1000;

    // Update animation duration
    dotElement.style.animationDuration = timeTakenInMillis + 'ms';
  }

  calculateDistance(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    const distance = Math.sqrt(
      Math.pow(rect1.x - rect2.x, 2) + Math.pow(rect1.y - rect2.y, 2)
    );
    return distance;
  }

  checkProximityAndNotify(thresholdDistance) {
    const dotElement = document.getElementById('dot');
    const dotStationElement = document.querySelector('.dot-station');
    const dotStationElement2 = document.querySelector('.dot-station2');
    const distance1 = this.calculateDistance(dotElement, dotStationElement);
    const distance2 = this.calculateDistance(dotElement, dotStationElement2);
    if (
      (distance1 < thresholdDistance || distance2 < thresholdDistance) &&
      !this.state.notified
    ) {
      alert('Dot is near a dot-station!');
      this.setState({ notified: true }); // Set the flag to true to indicate that notification has been triggered
    } else if (distance1 >= thresholdDistance && distance2 >= thresholdDistance) {
      this.setState({ notified: false }); // Reset the flag when the dot moves away from the dot-stations
    }
  }

  render() {
    return (
      <div className="container">
        <div className="line"></div>
        <div className="dot" id="dot"></div>
        <div className="dot-station"></div>
        <div className="dot-station2"></div>
      </div>
    );
  }
}

export default AnimatedDot;
