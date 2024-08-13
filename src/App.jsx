// import React from 'react';
// import Map from './components/Map';

// function App() {
//   const modelPath = '/upload/watch-tower/base.obj'; // Update this with the actual path to your 3D model file

//   return (
//     <div className="w-screen h-screen">
//       <Map modelPath={modelPath} />
//     </div>
//   );
// }

// export default App;


import React from "react";
import MapComponent from "./components/Map";

const modelPath = 'https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf';

const App = () => {
    return (
        <div className="w-screen h-screen">
            <MapComponent  modelPath={modelPath} />
        </div>
    );
};

export default App;
