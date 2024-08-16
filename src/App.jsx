import React, { useState } from "react";
import MapComponent from "./components/Map";

const App = () => {
    const [modelPath, setModelPath] = useState('https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf');
    const [filePath, setFilePath] = useState('');

    const handleUrlChange = (e) => {
        setModelPath(e.target.value);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("File :", file)
            // const fileURL = URL.createObjectURL(file);
            // console.log("FILE URL: ",fileURL);
            setFilePath(file);
            
        }
    };

    return (
        <div className="w-screen h-screen flex flex-col md:flex-row">
            {/* Input Section */}
            <div className="p-4 bg-gray-100 md:w-1/4 w-full">
                {/* URL Input */}
                <label htmlFor="modelPath" className="block mb-2 font-semibold">
                    3D Model URL:
                </label>
                <input
                    type="text"
                    id="modelPath"
                    value={modelPath}
                    onChange={handleUrlChange}
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                    placeholder="Enter model URL"
                />

                {/* File Upload Input */}
                <label htmlFor="fileInput" className="block mb-2 font-semibold">
                    Upload 3D Model File:
                </label>
                <input
                    type="file"
                    id="fileInput"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-gray-300 rounded"
                />
            </div>

            {/* Map Section */}
            <div className="flex-1">
                <MapComponent modelPath={filePath || modelPath} />
            </div>
        </div>
    );
};

export default App;
