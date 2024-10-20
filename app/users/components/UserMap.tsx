'use client';
import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from '../../components/Map.module.css'; // Ensure this CSS file is correctly linked

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

    // Fetch chargers from API
    useEffect(() => {
        const fetchChargers = async () => {
            try {
                const response = await fetch('/api/devices');
                const data = await response.json();
                console.log('Fetched chargers:', data);
                setChargers(data);
            } catch (error) {
                console.error('Error fetching chargers:', error);
            }
        };

        fetchChargers();

        // Ensure the map container exists before initializing
        if (!map && document.getElementById('map')) {
            const mapboxMap = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v11', // Ensure style is valid
                center: [0, 0],
                zoom: 2,
            });

            // Wait until the map is loaded before setting it
            mapboxMap.on('load', () => {
                setMap(mapboxMap);
            });
        }

        return () => map?.remove();
    }, [map]);

    // Function to add markers to the map
    const addMarkersToMap = (chargersToShow: Charger[]) => {
        if (map) {
            chargersToShow.forEach(charger => {
                const popupContent = `
                    <div class="${styles.popupContent}">
                        <h3 class="${styles.popupTitle}">${charger.manufacturer} - ${charger.model}</h3>
                        <div class="${styles.popupDetails}">
                            <p><strong>Status:</strong> ${charger.status}</p>
                            <p><strong>Energy Capacity:</strong> ${charger.energyCapacity}</p>
                            <p><strong>Connector Type:</strong> ${charger.connectorType}</p>
                            <p><strong>Firmware Version:</strong> ${charger.firmwareVersion}</p>
                            <p><strong>Software Version:</strong> ${charger.softwareVersion}</p>
                            <p><strong>Location:</strong> ${charger.location.zipCode} (${charger.location.latitude}, ${charger.location.longitude})</p>
                            <p><strong>On-chain Data:</strong> <a href="${charger.onChainData.vppScanUrl}" target="_blank">${charger.onChainData.transactionHash}</a></p>
                        </div>
                    </div>
                `;

                const marker = new mapboxgl.Marker()
                    .setLngLat([charger.location.longitude, charger.location.latitude])
                    .setPopup(new mapboxgl.Popup().setHTML(popupContent))
                    .addTo(map);

                marker.getElement().addEventListener('click', () => {
                    setSelectedCharger(charger); // Store selected charger
                });
            });
        }
    };

    // Add markers to the map when chargers are loaded
    useEffect(() => {
        if (map && chargers.length > 0) {
            addMarkersToMap(chargers);
        }
    }, [map, chargers]);

    // Handle connection to charger
    const handleConnect = () => {
        if (selectedCharger && selectedCharger.status === 'Available') {
            alert(`Connecting to ${selectedCharger.manufacturer} - ${selectedCharger.model}`);
            console.log("Charging amount:", chargeAmount);
            console.log("Device info:", deviceInfo);
        } else {
            alert('This charger is not available for connection.');
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleConnect();
    };

    return (
        <div className={styles.container}>
            <div className={styles.mapContainer}>
                <div id="map" className={styles.map} style={{ width: '100%', height: '100%' }}></div>
            </div>

            {selectedCharger && (
                <div className={styles.chargerDetails}>
                    <h2>Charger Details</h2>
                    <p><strong>Manufacturer:</strong> {selectedCharger.manufacturer}</p>
                    <p><strong>Model:</strong> {selectedCharger.model}</p>
                    <p><strong>Status:</strong> {selectedCharger.status}</p>
                    <p><strong>Energy Capacity:</strong> {selectedCharger.energyCapacity}</p>
                    <p><strong>Connector Type:</strong> {selectedCharger.connectorType}</p>
                    <p><strong>Location:</strong> {selectedCharger.location.zipCode} ({selectedCharger.location.latitude}, {selectedCharger.location.longitude})</p>

                    {selectedCharger.status === 'Available' ? (
                        <form onSubmit={handleFormSubmit}>
                            <div>
                                <label htmlFor="chargeAmount">Charge Amount (kWh):</label>
                                <input
                                    id="chargeAmount"
                                    type="number"
                                    placeholder="Enter amount"
                                    value={chargeAmount}
                                    onChange={(e) => setChargeAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="deviceName">Device Name:</label>
                                <input
                                    id="deviceName"
                                    type="text"
                                    placeholder="Enter your device name"
                                    value={deviceInfo.deviceName}
                                    onChange={(e) => setDeviceInfo({ ...deviceInfo, deviceName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="deviceType">Device Type:</label>
                                <input
                                    id="deviceType"
                                    type="text"
                                    placeholder="Enter device type (e.g., EV model)"
                                    value={deviceInfo.deviceType}
                                    onChange={(e) => setDeviceInfo({ ...deviceInfo, deviceType: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="batteryCapacity">Battery Capacity (kWh):</label>
                                <input
                                    id="batteryCapacity"
                                    type="number"
                                    placeholder="Enter battery capacity"
                                    value={deviceInfo.batteryCapacity}
                                    onChange={(e) => setDeviceInfo({ ...deviceInfo, batteryCapacity: e.target.value })}
                                    required
                                />
                            </div>
                            <button className={styles.connectButton} type="submit">Connect</button>
                        </form>
                    ) : (
                        <button className={styles.disabledButton} disabled>Not Available</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserMap;
