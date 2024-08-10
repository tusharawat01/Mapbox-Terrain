import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import mapboxgl from 'mapbox-gl';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const Map = ({ modelPath }) => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
  const rendererRef = useRef(new THREE.WebGLRenderer({ alpha: true }));
  const controlsRef = useRef();

  const handle2DClick = () => {
    if (mapRef.current) {
      mapRef.current.setPitch(0); // Reset pitch to 0 for 2D view
    }
  };

  const handle3DClick = () => {
    if (mapRef.current) {
      mapRef.current.setPitch(60); // Set pitch to 60 for 3D view
      loadModel(modelPath); // Load the 3D model when 3D button is clicked
    }
  };

  const loadModel = (modelPath) => {
    const { path, file } = extractPathAndFile(modelPath);
    const fileFormat = getFileFormat(file);

    let loader;
    switch (fileFormat) {
      case 'gltf':
        loader = loadGLTF;
        break;
      case 'obj':
        loader = loadOBJ;
        break;
      case 'ply':
        loader = loadPLY;
        break;
      case 'fbx':
        loader = loadFBX;
        break;
      case 'stl':
        loader = loadSTL;
        break;
      default:
        console.error('Unsupported file format.');
        return;
    }

    loader(path, file, sceneRef.current);
  };

  const getFileFormat = (filePath) => {
    return filePath.split('.').pop().toLowerCase();
  };

  const extractPathAndFile = (modelPath) => {
    const lastSlashIndex = modelPath?.lastIndexOf('/');
    const path = modelPath?.substring(0, lastSlashIndex + 1);
    const file = modelPath?.substring(lastSlashIndex + 1);
    return { path, file };
  };

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

      // Initialize OrbitControls
      controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.25;
      controlsRef.current.enableZoom = true;
    });

    // Set up camera
    cameraRef.current.position.set(0, 5, 10);

    // Set up renderer
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.outputEncoding = THREE.sRGBEncoding;
    mapContainerRef.current.appendChild(rendererRef.current.domElement);

    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // Handle window resize
    const onWindowResize = () => {
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      mapRef.current.remove();
      rendererRef.current.dispose();
    };
  }, []);

  return (
    <div ref={mapContainerRef} className="relative h-full w-full flex items-center">
      <div className="absolute border-2 border-gray-500 rounded-lg bg-white bottom-15 right-1.5 flex flex-col gap-2 p-1 z-10">
        <button
          onClick={handle2DClick}
          className="bg-white border py-0.5 px-1 rounded shadow hover:bg-orange-500"
          title="2D View"
        >
          2D
        </button>
        <button
          onClick={handle3DClick}
          className="bg-white border py-0.5 px-1 rounded shadow hover:bg-orange-500"
          title="3D View"
        >
          3D
        </button>
      </div>
    </div>
  );
};

const loadGLTF = (path, file, scene) => {
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    `${path}${file}`,
    (gltf) => {
      const model = gltf.scene || gltf.scenes[0];
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshNormalMaterial();
        }
      });
      scene.add(model);
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
    (error) => console.error('Error loading GLTF:', error)
  );
};

const loadOBJ = (path, file, scene) => {
  const objLoader = new OBJLoader();
  objLoader.load(
    `${path}${file}`,
    (object) => {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshNormalMaterial();
        }
      });
      scene.add(object);
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
    (error) => console.error('Error loading OBJ:', error)
  );
};

const loadPLY = (path, file, scene) => {
  const plyLoader = new PLYLoader();
  plyLoader.load(
    `${path}${file}`,
    (geometry) => {
      const material = new THREE.MeshNormalMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
    (error) => console.error('Error loading PLY:', error)
  );
};

const loadFBX = (path, file, scene) => {
  const fbxLoader = new FBXLoader();
  fbxLoader.load(
    `${path}${file}`,
    (object) => {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshNormalMaterial();
        }
      });
      scene.add(object);
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
    (error) => console.error('Error loading FBX:', error)
  );
};

const loadSTL = (path, file, scene) => {
  const stlLoader = new STLLoader();
  stlLoader.load(
    `${path}${file}`,
    (geometry) => {
      const material = new THREE.MeshNormalMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
    (error) => console.error('Error loading STL:', error)
  );
};

export default Map;
