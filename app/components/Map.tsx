n'use client';
import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './Map.module.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiZGVqYW5mZXRvdnNraSIsImEiOiJjbTJkaWd5c3IxZHpkMmpyMnFoNmM5Mnh4In0.G7TWLfvTgQtdtROdDQJFcQ';

interface Device {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    details?: string; // Make details optional if not provided
    zipCode: string,
    power: number, // Ensure power is a number
}

const Map = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
    const [deviceInfo, setDeviceInfo] = useState<{ name: string; lat: string; long: string; details: string, zipCode: string, power: number}>({
        name: '',
        lat: '',
        long: '',
        details: '', // Ensure details is included in initial state
        zipCode:'',
        power: 0
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
                if (!isNaN(device.longitude) && !isNaN(device.latitude)) {
                    new mapboxgl.Marker()
                        .setLngLat([device.longitude, device.latitude])
                        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${device.name}</h3><p>${device.details || ''}</p><p>${device.zipCode || ''}</p>`))
                        .addTo(map);
                } else {
                    console.error(`Invalid coordinates for device ${device.name}: (${device.longitude}, ${device.latitude})`);
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
        setFilteredDevices(devices.filter(device => device.name.toLowerCase().includes(value.toLowerCase())));
    };

    // Form handling
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDeviceInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Convert lat and long to numbers
        const latitude = parseFloat(deviceInfo.lat);
        const longitude = parseFloat(deviceInfo.long);

        // Validate latitude and longitude
        if (isNaN(latitude) || isNaN(longitude)) {
            console.error("Invalid latitude or longitude");
            return; // Prevent submission if lat/long is invalid
        }

        const newDevice = {
            name: deviceInfo.name,
            latitude: latitude,  // Ensure lat is a number
            longitude: longitude, // Ensure long is a number
            details: deviceInfo.details || 'Connected',  // Use deviceInfo.details or default to 'Connected',
            zipCode: deviceInfo.zipCode,
            power: deviceInfo.power
        };

        try {
            const response = await fetch('/api/addDevice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDevice),
            });

            if (response.ok) {
                const addedDevice = await response.json();

                // Ensure the response structure is correct
                if (addedDevice && addedDevice.id) {
                    // Update devices state to include the newly added device
                    const updatedDevices = [...devices, addedDevice];
                    setDevices(updatedDevices);
                    setFilteredDevices(updatedDevices); // Update filtered devices as well

                    // Add the new marker
                    addMarkersToMap(updatedDevices);

                    // Reset form fields
                    setDeviceInfo({ name: '', lat: '', long: '', details: '', zipCode : '', power: 0 }); // Reset all fields
                    console.log('Device added successfully:', addedDevice);
                } else {
                    console.error('Invalid device added:', addedDevice);
                }
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
                <h2 className={styles.title}>Add New Device</h2>
                <input
                    className={styles.input}
                    name="name"
                    placeholder="Device Name"
                    value={deviceInfo.name}
                    onChange={handleFormChange}
                    required
                />
                <input
                    className={styles.input}
                    name="lat"
                    placeholder="Latitude"
                    type="number"
                    value={deviceInfo.lat}
                    onChange={handleFormChange}
                    required
                />
                <input
                    className={styles.input}
                    name="long"
                    placeholder="Longitude"
                    type="number"
                    value={deviceInfo.long}
                    onChange={handleFormChange}
                    required
                />
                <input
                    className={styles.input}
                    name="power"
                    placeholder="Power"
                    value={deviceInfo.power} // Controlled input
                    onChange={handleFormChange}
                    required
                />
                 <input
                    className={styles.input}
                    name="zipCode"
                    placeholder="Zipcode"
                    value={deviceInfo.zipCode} // Controlled input
                    onChange={handleFormChange}
                    required
                />
                 
                <input
                    className={styles.input}
                    name="details"
                    placeholder="Device Details"
                    value={deviceInfo.details} // Controlled input
                    onChange={handleFormChange}
                    required
                />
                
                <button type="submit" className={styles.submitBtn}>Add Device</button>
            </form>

            {/* Map and Device Info Panel */}
            <div className={styles.mapInfoContainer}>
                {/* Map Section */}
                <div className={styles.map}>
                    <div id="map" style={{ width: '100%', height: '100%' }} />
                </div>

                {/* Device Search & Connected Devices Info */}
                <div className={styles.sidebar}>
                    <input
                        type="text"
                        placeholder="Search devices..."
                        value={searchTerm}
                        onChange={handleInputChange}
                        className={styles.searchInput}
                    />
                    {filteredDevices.length > 0 ? (
                        <ul className={styles.deviceList}>
                            {filteredDevices.map(device => (
                                <li key={device.id} className={styles.deviceItem}>
                                    <div className={styles.deviceInfo}>
                                        <h4>{device.name}</h4>
                                        <p>{device.details || 'No details available'}</p>
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
