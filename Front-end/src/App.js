import React from 'react';
import WelcomeMessage from './components/welcomeMessage';
import mySound from './sounds/ford-start.mp3'
import './App.css';

class App extends  React.Component{
  constructor(){
    super();
    this.state ={
      showWelcome: true,
      showBackground: false,
      showConsentModal: false,
      userConsent: '',
      showBlankScreen: false
    }
    this.closeWelcome = this.closeWelcome.bind(this);
    this.audio = new Audio(mySound);
  }
  closeWelcome ()  {
    this.setState({ showWelcome: false, showConsentModal: true, showBackground: true });
    this.audio.currentTime = 1;
    this.audio.play().catch(error => console.error("Audio play failed:", error));

    // After the sound plays for 3 seconds, show a blank screen
    setTimeout(() => {
      this.audio.pause();
      this.audio.currentTime = 0;
    }, 3000);
  };

  componentDidMount(){	

	}
  
  handleConsent = (consentType) => {
    this.setState({ showConsentModal: false, userConsent: consentType, showBackground: true,showBlankScreen: true  });
  };
  
  renderConsentModal() {
    if (!this.state.showConsentModal) return null;
  
    return (
      <div className="modal">
      <div className="modal-content">
        <h2>Which service would you like to choose from</h2>
        <button onClick={() => this.handleConsent('Charging_points')}>Charging points</button>
        <button onClick={() => this.handleConsent('Connect')}>Connect with fellow Ford travelers</button>
        <button onClick={() => this.handleConsent('Exit')}>Exit</button>
      </div>
    </div>
    );
  }

  render() {
    if (this.state.showBlankScreen) {
      return <div className="blank-screen"></div>; // Ensure you have styles set for .blank-screen to make it truly blank or styled as you wish
    }

    return (
      <div>
        {this.state.showWelcome ? (
          <WelcomeMessage onClose={this.closeWelcome} />
        ) : this.state.showConsentModal || this.state.showBackground ? (
          <div>
            {this.renderConsentModal()}
            <div className="background-image">
              {/* Background image displayed*/}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default App;
