import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';

const Map = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  const handle2DClick = () => {
    if (mapRef.current) {
      mapRef.current.setPitch(0); // Reset pitch to 0 for 2D view
    }
  };

  const handle3DClick = () => {
    if (mapRef.current) {
      mapRef.current.setPitch(81); // Set pitch to 60 for 3D view
    }
  };

  // const handleVRClick = () => {
  //   if (mapRef.current) {
  //     mapRef.current.setPitch(60); // Set pitch to 60 for VR-like view
  //     mapRef.current.setBearing(0); // Reset bearing for VR-like view
  //   }
  // };

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      zoom: 15,
      center: [24.343227, 42.357648],
      pitch: 0,
      bearing: 41,
      style: 'mapbox://styles/mapbox/satellite-streets-v12'
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

    mapRef.current.on('style.load', () => {
      mapRef.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });

      mapRef.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    });
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="relative h-full w-full flex items-center"
    >
      <div className="absolute border-2 border-gray-500 rounded-lg bg-white bottom-15 right-1.5  flex flex-col gap-2 p-1 z-10">
        <button
          onClick={handle2DClick}
          className="bg-white border  py-0.5 px-1 rounded shadow hover:bg-orange-500"
          title="2D View"
        >
          2D
        </button>
        <button
          onClick={handle3DClick}
          className="bg-white border  py-0.5 px-1 rounded shadow hover:bg-orange-500"
          title="3D View"
        >
          3D
        </button>
        <button
          className="bg-white border  py-0.5 px-1 rounded shadow hover:bg-orange-500"
          title="VR View"
        >
          VR
        </button>
      </div>
    </div>
  );
};

export default Map;
