import { useState } from 'react';
import './App.css';
import LocationTracker from './components/LocationTracker';
import IntelligentPlacesQuery from './components/IntelligentPlacesQuery';

function App() {
  const [userLocation, setUserLocation] = useState(null);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Super Map - AI-Powered Places Search</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <LocationTracker onLocationChange={setUserLocation} />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <IntelligentPlacesQuery location={userLocation} />
      </div>
    </div>
  );
}

export default App;

