import { useState } from 'react';
import './App.css';
import LocationTracker from './components/LocationTracker';
import IntelligentPlacesQuery from './components/IntelligentPlacesQuery';

function App() {
  const [userLocation, setUserLocation] = useState(null);

  return (
    <div className="app">
      <h1 className="app-title">Super Map - AI-Powered Places Search</h1>
      
      <div className="section">
        <LocationTracker onLocationChange={setUserLocation} />
      </div>

      <div className="section">
        <IntelligentPlacesQuery location={userLocation} />
      </div>
    </div>
  );
}

export default App;

