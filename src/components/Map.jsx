import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapComponent = ({ modelPath }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [viewMode, setViewMode] = useState("2D");
    const modelLayer = useRef(null);

    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/satellite-streets-v12',
                zoom: 18,
                center: [148.9819, -35.3981],
                pitch: viewMode === "3D" ? 60 : 0,
                antialias: true
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
            map.current.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

            map.current.on('style.load', () => {
                if (viewMode === "3D") {
                    add3DModel(map.current, modelPath);
                }
            });
        } else {
            map.current.setPitch(viewMode === "3D" ? 60 : 0);
            if (modelLayer.current) {
                map.current.removeLayer('3d-model');
                modelLayer.current = null;
            }
            if (viewMode === "3D") {
                add3DModel(map.current, modelPath);
            }
        }
    }, [viewMode, modelPath]);

    const add3DModel = (map, modelPath) => {
        const modelOrigin = [148.9819, -35.39847];
        const modelAltitude = 0;
        const modelRotate = [Math.PI / 2, 0, 0];

        const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
            modelOrigin,
            modelAltitude
        );

        const modelTransform = {
            translateX: modelAsMercatorCoordinate.x,
            translateY: modelAsMercatorCoordinate.y,
            translateZ: modelAsMercatorCoordinate.z,
            rotateX: modelRotate[0],
            rotateY: modelRotate[1],
            rotateZ: modelRotate[2],
            scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
        };

        const customLayer = {
            id: '3d-model',
            type: 'custom',
            renderingMode: '3d',
            onAdd: function (map, gl) {
                this.camera = new THREE.Camera();
                this.scene = new THREE.Scene();

                const directionalLight = new THREE.DirectionalLight(0xffffff);
                directionalLight.position.set(0, -70, 100).normalize();
                this.scene.add(directionalLight);

                const directionalLight2 = new THREE.DirectionalLight(0xffffff);
                directionalLight2.position.set(0, 70, 100).normalize();
                this.scene.add(directionalLight2);

                const loader = getLoader(modelPath);
                if (loader) {
                    loader.load(modelPath, (model) => {
                        this.scene.add(model.scene || model);
                    });
                }

                this.map = map;

                this.renderer = new THREE.WebGLRenderer({
                    canvas: map.getCanvas(),
                    context: gl,
                    antialias: true
                });

                this.renderer.autoClear = false;
            },
            render: function (gl, matrix) {
                const rotationX = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(1, 0, 0),
                    modelTransform.rotateX
                );
                const rotationY = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(0, 1, 0),
                    modelTransform.rotateY
                );
                const rotationZ = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(0, 0, 1),
                    modelTransform.rotateZ
                );

                const m = new THREE.Matrix4().fromArray(matrix);
                const l = new THREE.Matrix4()
                    .makeTranslation(
                        modelTransform.translateX,
                        modelTransform.translateY,
                        modelTransform.translateZ
                    )
                    .scale(
                        new THREE.Vector3(
                            modelTransform.scale,
                            -modelTransform.scale,
                            modelTransform.scale
                        )
                    )
                    .multiply(rotationX)
                    .multiply(rotationY)
                    .multiply(rotationZ);

                this.camera.projectionMatrix = m.multiply(l);
                this.renderer.resetState();
                this.renderer.render(this.scene, this.camera);
                this.map.triggerRepaint();
            }
        };

        map.addLayer(customLayer, 'waterway-label');
        modelLayer.current = customLayer;
    };

    const getLoader = (modelPath) => {
        const extension = modelPath.split('.').pop().toLowerCase();
        switch (extension) {
            case 'gltf':
            case 'glb':
                return new GLTFLoader();
            case 'obj':
                return new OBJLoader();
            case 'ply':
                return new PLYLoader();
            case 'fbx':
                return new FBXLoader();
            case 'stl':
                return new STLLoader();
            default:
                console.error('Unsupported model format');
                return null;
        }
    };

    const handleViewChange = (mode) => {
        setViewMode(mode);
    };

    return (
        <div className="relative h-screen w-full">
            <div className="absolute top-4 left-4 z-10 space-x-2">
                <button onClick={() => handleViewChange("2D")} className="bg-blue-500 text-white px-4 py-2 rounded">
                    2D View
                </button>
                <button onClick={() => handleViewChange("3D")} className="bg-blue-500 text-white px-4 py-2 rounded">
                    3D View
                </button>
            </div>
            <div ref={mapContainer} className="h-full w-full"></div>
        </div>
    );
};

export default MapComponent;
