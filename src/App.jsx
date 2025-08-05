import { useState } from 'react';
import './App.css';
import LocationTracker from './components/LocationTracker';
import IntelligentPlacesQuery from './components/IntelligentPlacesQuery';

function App() {
  const [userLocation, setUserLocation] = useState(null);

  return (
    <div className="app">
      <div className="app-header">
        <h1 className="app-title">Super Map</h1>
        <p className="app-subtitle">AI-powered places discovery</p>
      </div>
      
      <div className="main-content">
        <LocationTracker onLocationChange={setUserLocation} />
        <IntelligentPlacesQuery location={userLocation} />
      </div>
    </div>
  );
}

export default App;

