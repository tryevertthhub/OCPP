'use client';
import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './Map.module.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiZGVqYW5mZXRvdnNraSIsImEiOiJjbTJkaWd5c3IxZHpkMmpyMnFoNmM5Mnh4In0.G7TWLfvTgQtdtROdDQJFcQ';

const Map = () => {
    const [devices, setDevices] = useState([]);
    const [map, setMap] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDevices, setFilteredDevices] = useState([]);
    const [deviceInfo, setDeviceInfo] = useState({
        name: '',
        lat: '',
        long: '',
        details: '',
        zipCode: '', // Add zipCode for utility territory
    });

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

    const addMarkersToMap = (devicesToShow) => {
        if (map) {
            const markers = document.getElementsByClassName('mapboxgl-marker');
            while (markers[0]) {
                markers[0].remove();
            }

            devicesToShow.forEach(device => {
                if (!isNaN(device.longitude) && !isNaN(device.latitude)) {
                    new mapboxgl.Marker()
                        .setLngLat([device.longitude, device.latitude])
                        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${device.name}</h3><p>Zip Code: ${device.zipCode}</p><p>${device.details || ''}</p>`))
                        .addTo(map);
                }
            });
        }
    };

    useEffect(() => {
        addMarkersToMap(filteredDevices);
    }, [map, filteredDevices]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setFilteredDevices(devices.filter(device => device.name.toLowerCase().includes(value.toLowerCase())));
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setDeviceInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const latitude = parseFloat(deviceInfo.lat);
        const longitude = parseFloat(deviceInfo.long);

        if (isNaN(latitude) || isNaN(longitude)) {
            console.error("Invalid latitude or longitude");
            return;
        }

        const newDevice = {
            name: deviceInfo.name,
            latitude,
            longitude,
            details: deviceInfo.details || 'Connected',
            zipCode: deviceInfo.zipCode, // Add zipCode here
        };

        try {
            const response = await fetch('/api/addDevice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDevice),
            });

            if (response.ok) {
                const addedDevice = await response.json();
                const updatedDevices = [...devices, addedDevice];
                setDevices(updatedDevices);
                setFilteredDevices(updatedDevices);
                addMarkersToMap(updatedDevices);
                setDeviceInfo({ name: '', lat: '', long: '', details: '', zipCode: '' });
            } else {
                console.error('Failed to add device', response.statusText);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleFormSubmit} className={styles.addDeviceForm}>
                <h2 className={styles.title}>Add New Device</h2>
                <input className={styles.input} name="name" placeholder="Device Name" value={deviceInfo.name} onChange={handleFormChange} required />
                <input className={styles.input} name="lat" placeholder="Latitude" type="number" value={deviceInfo.lat} onChange={handleFormChange} required />
                <input className={styles.input} name="long" placeholder="Longitude" type="number" value={deviceInfo.long} onChange={handleFormChange} required />
                <input className={styles.input} name="zipCode" placeholder="Zip Code" value={deviceInfo.zipCode} onChange={handleFormChange} required />
                <input className={styles.input} name="details" placeholder="Device Details" value={deviceInfo.details} onChange={handleFormChange} />
                <button type="submit" className={styles.submitBtn}>Add Device</button>
            </form>

            <div className={styles.mapInfoContainer}>
                <div className={styles.map}>
                    <div id="map" style={{ width: '100%', height: '100%' }} />
                </div>
                <div className={styles.sidebar}>
                    <input type="text" placeholder="Search devices..." value={searchTerm} onChange={handleInputChange} className={styles.searchInput} />
                    {filteredDevices.length > 0 ? (
                        <ul className={styles.deviceList}>
                            {filteredDevices.map(device => (
                                <li key={device.id} className={styles.deviceItem}>
                                    <div className={styles.deviceInfo}>
                                        <h4>{device.name}</h4>
                                        <p>{device.details}</p>
                                        <p>Zip Code: {device.zipCode}</p>
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
