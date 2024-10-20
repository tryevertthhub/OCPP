'use client';
import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './Map.module.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiZGVqYW5mZXRvdnNraSIsImEiOiJjbTJkaWd5c3IxZHpkMmpyMnFoNmM5Mnh4In0.G7TWLfvTgQtdtROdDQJFcQ';


interface OnChainData {
    transactionHash: string;
    timestamp: string;
    blockNumber: number;
    vppScanUrl: string;
}

interface Device {
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

const Map = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
    const [deviceInfo, setDeviceInfo] = useState({
        name: '', // Added 'name'
        manufacturer: '',
        model: '',
        energyCapacity: '',
        status: '',
        firmwareVersion: '',
        softwareVersion: '',
        connectorType: '',
        details: '', // Added 'details'
        power: '', // Added 'power'
        lat: '',
        long: '',
        zipCode: '',
        transactionHash: '',
        timestamp: '',
        blockNumber: '',
        vppScanUrl: ''
    });

    // Fetch devices from API
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch('/api/devices');
                const data = await response.json();
                setDevices(data);
                setFilteredDevices(data);
            } catch (error) {
                console.error("Error fetching devices:", error);
            }
        };

        fetchDevices();

        const mapboxMap = new mapboxgl.Map({
            container: 'map',
            center: [0, 0],
            zoom: 2,
        });

        setMap(mapboxMap);

        return () => mapboxMap.remove();
    }, []);

    // Function to add markers to the map
    const addMarkersToMap = (devicesToShow: Device[]) => {
        if (map) {
            // Clear existing markers first
            const markers = document.getElementsByClassName('mapboxgl-marker');
            while (markers[0]) {
                markers[0].remove();
            }
    
            // Add new markers
            devicesToShow.forEach(device => {
                if (device.location && !isNaN(device.location.longitude) && !isNaN(device.location.latitude)) {
                    const popupContent = `
                        <div class="popup-content">
                            <div class="popup-header">
                                <h3 class="popup-title">${device.manufacturer} - ${device.model}</h3>
                            </div>
                            <div class="popup-body">
                                <p><strong>Status:</strong> ${device.status}</p>
                                <p><strong>Energy Capacity:</strong> ${device.energyCapacity}</p>
                                <p><strong>Connector Type:</strong> ${device.connectorType}</p>
                                <p><strong>Firmware Version:</strong> ${device.firmwareVersion}</p>
                                <p><strong>Software Version:</strong> ${device.softwareVersion}</p>
                                <p><strong>Location:</strong> ${device.location.zipCode} (${device.location.latitude}, ${device.location.longitude})</p>
                                <p><strong>On-chain Data:</strong> <a href="${device.onChainData.vppScanUrl}" target="_blank">${device.onChainData.transactionHash}</a></p>
                            </div>
                        </div>
                    `;
    
                    new mapboxgl.Marker()
                        .setLngLat([device.location.longitude, device.location.latitude])
                        .setPopup(new mapboxgl.Popup().setHTML(popupContent))
                        .addTo(map);
                } else {
                    console.error(`Invalid or missing location for device ${device.manufacturer} - ${device.model}`);
                }
            });
        }
    };

    // Initial markers on load
    useEffect(() => {
        addMarkersToMap(filteredDevices);
    }, [map, filteredDevices]);

    // Search functionality
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setFilteredDevices(devices.filter(device => device.manufacturer.toLowerCase().includes(value.toLowerCase())));
    };

    // Form handling
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDeviceInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Parse lat, long, power values as numbers
        const latitude = parseFloat(deviceInfo.lat);
        const longitude = parseFloat(deviceInfo.long);
        const power = parseFloat(deviceInfo.power); // Ensure 'power' is converted to a number
    
        if (isNaN(latitude) || isNaN(longitude) || isNaN(power)) {
            console.error("Invalid latitude, longitude, or power");
            return;
        }
    
        // Construct new device object with the correct data
        const newDevice = {
            name: deviceInfo.name,
            manufacturer: deviceInfo.manufacturer,
            model: deviceInfo.model,
            energyCapacity: deviceInfo.energyCapacity,
            status: deviceInfo.status,
            firmwareVersion: deviceInfo.firmwareVersion,
            softwareVersion: deviceInfo.softwareVersion,
            connectorType: deviceInfo.connectorType,
            location: {
                latitude, // Latitude passed correctly
                longitude, // Longitude passed correctly
                zipCode: deviceInfo.zipCode // Ensure zipCode is passed correctly
            },
            details: deviceInfo.details,
            power: power, // Power passed correctly
            onChainData: {
                transactionHash: deviceInfo.transactionHash || `0x${Math.random().toString(36).substr(2, 10)}`,
                timestamp: deviceInfo.timestamp || new Date().toISOString(),
                blockNumber: Number(deviceInfo.blockNumber) || Math.floor(Math.random() * 1000000),
                vppScanUrl: deviceInfo.vppScanUrl || 'https://vppscan.com/tx/0xabc123'
            }
        };
       console.log(newDevice);
        try {
            const response = await fetch('/api/addDevice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDevice)
            });
    
            if (response.ok) {
                const addedDevice = await response.json();
                setDevices([...devices, addedDevice]);
                setFilteredDevices([...devices, addedDevice]);
                addMarkersToMap([...devices, addedDevice]);
    
                // Reset form fields after successful submission
                setDeviceInfo({
                    name: '',
                    manufacturer: '',
                    model: '',
                    energyCapacity: '',
                    status: '',
                    firmwareVersion: '',
                    softwareVersion: '',
                    connectorType: '',
                    details: '',
                    power: '',
                    lat: '',
                    long: '',
                    zipCode: '',
                    transactionHash: '',
                    timestamp: '',
                    blockNumber: '',
                    vppScanUrl: ''
                });
            } else {
                console.error('Failed to add device', response.statusText);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };
    
    
    
    return (
        <div className={styles.container}>
            {/* Form at the top */}
            <form onSubmit={handleFormSubmit} className={styles.addDeviceForm}>
                <input className={styles.input} name="name" placeholder="Charger Name" value={deviceInfo.name} onChange={handleFormChange} required />
                <input className={styles.input} name="manufacturer" placeholder="Manufacturer" value={deviceInfo.manufacturer} onChange={handleFormChange} required />
                <input className={styles.input} name="model" placeholder="Model" value={deviceInfo.model} onChange={handleFormChange} required />
                <input className={styles.input} name="energyCapacity" placeholder="Energy Capacity" value={deviceInfo.energyCapacity} onChange={handleFormChange} required />
                <input className={styles.input} name="status" placeholder="Status" value={deviceInfo.status} onChange={handleFormChange} required />
                <input className={styles.input} name="firmwareVersion" placeholder="Firmware Version" value={deviceInfo.firmwareVersion} onChange={handleFormChange} required />
                <input className={styles.input} name="softwareVersion" placeholder="Software Version" value={deviceInfo.softwareVersion} onChange={handleFormChange} required />
                <input className={styles.input} name="connectorType" placeholder="Connector Type" value={deviceInfo.connectorType} onChange={handleFormChange} required />
                <input className={styles.input} name="lat" placeholder="Latitude" type="number" value={deviceInfo.lat} onChange={handleFormChange} required />
                <input className={styles.input} name="long" placeholder="Longitude" type="number" value={deviceInfo.long} onChange={handleFormChange} required />
                <input className={styles.input} name="zipCode" placeholder="Zipcode" value={deviceInfo.zipCode} onChange={handleFormChange} required />
                <input className={styles.input} name="power" placeholder="Power (kW)" type="number" value={deviceInfo.power} onChange={handleFormChange} required />
                <input className={styles.input} name="details" placeholder="Details" value={deviceInfo.details} onChange={handleFormChange} />
                <button type="submit" className={styles.submitBtn}>Add Charger</button>
            </form>




            {/* Map and Device Info Panel */}
            <div className={styles.mapInfoContainer}>
                <div className={styles.map}>
                    <div id="map" style={{ width: '100%', height: '100%' }} />
                </div>

                <div className={styles.sidebar}>
                    <input type="text" placeholder="Search chargers..." value={searchTerm} onChange={handleInputChange} className={styles.searchInput} />
                    {filteredDevices.length > 0 ? (
                        <ul className={styles.deviceList}>
                            {filteredDevices.map(device => (
                                <li key={device.id} className={styles.deviceItem}>
                                    <div className={styles.deviceInfo}>
                                        <h4>{device.manufacturer} - {device.model}</h4>
                                        <p>{device.status}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.noDevices}>No devices found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Map;
