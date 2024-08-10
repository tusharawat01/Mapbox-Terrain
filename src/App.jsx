import React from 'react';
import Map from './components/Map';

function App() {
  const modelPath = '/upload/watch-tower/base.obj'; // Update this with the actual path to your 3D model file

  return (
    <div className="w-screen h-screen">
      <Map modelPath={modelPath} />
    </div>
  );
}

export default App;
