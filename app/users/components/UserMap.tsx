/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from '../../components/Map.module.css';
import { motion } from 'framer-motion'; // For animation

mapboxgl.accessToken = 'pk.eyJ1IjoiZGVqYW5mZXRvdnNraSIsImEiOiJjbTJkaWd5c3IxZHpkMmpyMnFoNmM5Mnh4In0.G7TWLfvTgQtdtROdDQJFcQ';

interface OnChainData {
    transactionHash: string;
    timestamp: string;
    blockNumber: number;
    vppScanUrl: string;
}

interface Charger {
    id: string;
    manufacturer: string;
    model: string;
    energyCapacity: string;
    status: string;
    firmwareVersion: string;
    softwareVersion: string;
    connectorType: string;
    location: {
        latitude: number;
        longitude: number;
        zipCode: string;
    };
    onChainData: OnChainData;
}

const UserMap = () => {
    const [chargers, setChargers] = useState<Charger[]>([]);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
    const [chargeAmount, setChargeAmount] = useState('');
    const [deviceInfo, setDeviceInfo] = useState({
        deviceName: '',
        deviceType: '',
        batteryCapacity: '',
    });
    const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

    // Fetch chargers from API
    useEffect(() => {
        const fetchChargers = async () => {
            try {
                const response = await fetch('/api/devices');
                const data = await response.json();
                setChargers(data);
            } catch (error) {
                console.error('Error fetching chargers:', error);
            }
        };

        fetchChargers();

        if (!map) {
            const mapboxMap = new mapboxgl.Map({
                container: 'map',
                center: [0, 0],
                zoom: 2,
            });

            mapboxMap.on('load', () => {
                setMap(mapboxMap);
            });
        }

        return () => {
            if (map) {
                map.remove();
            }
        };
    }, [map]);

    // Function to add markers to the map
    const addMarkersToMap = (chargersToShow: Charger[]) => {
        if (map) {
            markers.forEach(marker => marker.remove());
            setMarkers([]);

            chargersToShow.forEach(charger => {
                const marker = new mapboxgl.Marker()
                    .setLngLat([charger.location.longitude, charger.location.latitude])
                    .addTo(map);

                marker.getElement().addEventListener('click', () => {
                    setSelectedCharger(charger);
                });

                setMarkers(prev => [...prev, marker]);
            });
        }
    };

    // Add markers when chargers are ready
    useEffect(() => {
        if (map && chargers.length > 0) {
            addMarkersToMap(chargers);
        }
    }, [map, chargers]);

    // Handle form submission for charging
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (selectedCharger && selectedCharger.status === 'Available') {
            console.log('Charging amount:', chargeAmount);
            console.log('Device info:', deviceInfo);
        } else {
            alert('This charger is not available for connection.');
        }
    };

    return (
        <div className="relative h-screen w-full">
            <div id="map" className="absolute inset-0 w-full h-full" />

            {selectedCharger && (
                <motion.div
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '100%' }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-4 right-4 p-6 w-96 bg-white/30 backdrop-blur-md shadow-lg rounded-lg text-white space-y-6"
                >
                    <h2 className="text-3xl font-semibold text-blue-200">Charger Details</h2>
                    <p><strong>Manufacturer:</strong> {selectedCharger.manufacturer}</p>
                    <p><strong>Model:</strong> {selectedCharger.model}</p>
                    <p><strong>Status:</strong> {selectedCharger.status}</p>
                    <p><strong>Energy Capacity:</strong> {selectedCharger.energyCapacity}</p>
                    <p><strong>Connector Type:</strong> {selectedCharger.connectorType}</p>
                    <p><strong>Location:</strong> {selectedCharger.location.zipCode} ({selectedCharger.location.latitude}, {selectedCharger.location.longitude})</p>

                    {selectedCharger.status === 'Available' ? (
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="chargeAmount" className="block font-medium text-white">Charge Amount (kWh):</label>
                                <input
                                    id="chargeAmount"
                                    type="number"
                                    placeholder="Enter amount"
                                    value={chargeAmount}
                                    onChange={(e) => setChargeAmount(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md shadow-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="deviceName" className="block font-medium text-white">Device Name:</label>
                                <input
                                    id="deviceName"
                                    type="text"
                                    placeholder="Enter your device name"
                                    value={deviceInfo.deviceName}
                                    onChange={(e) => setDeviceInfo({ ...deviceInfo, deviceName: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md shadow-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="deviceType" className="block font-medium text-white">Device Type:</label>
                                <input
                                    id="deviceType"
                                    type="text"
                                    placeholder="Enter device type"
                                    value={deviceInfo.deviceType}
                                    onChange={(e) => setDeviceInfo({ ...deviceInfo, deviceType: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md shadow-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="batteryCapacity" className="block font-medium text-white">Battery Capacity (kWh):</label>
                                <input
                                    id="batteryCapacity"
                                    type="number"
                                    placeholder="Enter battery capacity"
                                    value={deviceInfo.batteryCapacity}
                                    onChange={(e) => setDeviceInfo({ ...deviceInfo, batteryCapacity: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md shadow-sm"
                                    required
                                />
                            </div>
                            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition">Connect</button>
                        </form>
                    ) : (
                        <button className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed" disabled>Not Available</button>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default UserMap;
