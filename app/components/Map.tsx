/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { motion } from 'framer-motion';
import { Dialog } from '@headlessui/react'; // Headless UI for modal
import { ethers } from 'ethers'; // Import ethers.js
import { BrowserProvider, Contract } from 'ethers';

import CONTRACT_ABI from '../utils/ABI';

import 'mapbox-gl/dist/mapbox-gl.css';

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ethereum: any;
    }
}
const CONTRACT_ADDRESS = '0x70774c2d0BB9Fe7564D4557CD417b23C757e2126';



mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface Device {
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
  
}

interface Charger {
    station_name: string;
    latitude: number;
    longitude: number;
    street_address: string;
}

const Map = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null); 
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [deviceInfo, setDeviceInfo] = useState({
        manufacturer: '',
        model: '',
        energyCapacity: '',
        status: '',
        firmwareVersion: '',
        softwareVersion: '',
        connectorType: '',
        power: '',
        lat: '',
        long: '',
        zipCode: ''
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [contract, setContract] = useState<Contract | null>(null);

    const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

    const [chargers, setChargers] = useState<Charger[]>([]);

    
     // Initialize ethers.js provider, signer, and contract
     useEffect(() => {
        const initBlockchain = async () => {
            // Check if MetaMask or any Ethereum wallet provider is installed
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const provider = new BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
                    setProvider(provider);
                    setSigner(signer);
                    setContract(contract);
    
                    // Request accounts to connect
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                } catch (error) {
                    console.error('Error initializing blockchain connection:', error);
                }
            } else {
                console.warn('MetaMask or other Ethereum wallet is not installed. Blockchain-related features will not work.');
            }
        };
    
        // Initialize mapbox even if no wallet is available
       const initMapbox = () => {
            const mapboxMap = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/dark-v10',  // Set the map style to dark
                center: [0, 0], // Center on the globe
                zoom: 2,
                projection: 'globe',  // Use the globe projection
            });
    
            mapboxMap.on('style.load', () => {
                mapboxMap.setFog({
                    'range': [-1, 3],
                    'color': 'black',
                    'horizon-blend': 0.3,
                    'high-color': '#000000',
                    'space-color': '#000000',
                    'star-intensity': 0.95,
                });
            });
    
            mapboxMap.dragRotate.enable();
            mapboxMap.touchZoomRotate.enable();
    
            setMap(mapboxMap);
    
            return () => mapboxMap.remove();
        };
    
        initBlockchain();
        initMapbox();
        fetchAFDCChargers();  // Fetch charger data for the map
    
    }, []);  // Empty dependency array to only run on component mount
    

    useEffect(() => {
        if (map && chargers.length > 0) {
            chargers.forEach(charger => {
                const marker = new mapboxgl.Marker()
                    .setLngLat([charger.longitude, charger.latitude]) // Charger location
                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${charger.station_name}</h3><p>${charger.street_address}</p>`)) // Show station info
                    .addTo(map);
            });
        }
    }, [map, chargers]);
    
    useEffect(() => {
        addMarkersToMap(filteredDevices);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, filteredDevices]);

    // Fetch chargers from the contract (assuming the contract has a getChargers function)
    const fetchChargers = async () => {
      if (contract) {
          try {
              // Fetch chargers from the contract
              const chargers = await contract.getAllChargers();
  
              // Map through the result and properly decode the data
              const decodedChargers = chargers.map((charger: any) => ({
                  manufacturer: charger.manufacturer,
                  model: charger.model,
                  energyCapacity: charger.energyCapacity,
                  status: charger.status,
                  firmwareVersion: charger.firmwareVersion,
                  softwareVersion: charger.softwareVersion,
                  connectorType: charger.connectorType,
                  location: {
                      latitude: charger.latitude.toString(),  // Convert latitude BigNumber
                      longitude: charger.longitude.toString(),  // Convert longitude BigNumber
                      zipCode: charger.zipCode
                  }
              }));
  
              // Update state with the decoded chargers
              setDevices(decodedChargers);
              setFilteredDevices(decodedChargers);
              console.log(decodedChargers); // Now you should see properly decoded data
          } catch (error) {
              console.error('Error fetching chargers:', error);
          }
      }
  };
  
    const fetchAFDCChargers = async () => {
      const apiKey = process.env.NEXT_PUBLIC_AGFC_KEY;  // Replace with your API key
      const response = await fetch(`https://developer.nrel.gov/api/alt-fuel-stations/v1/nearest.json?fuel_type=ELEC&location=Denver,CO&radius=50&api_key=${apiKey}`);
      const data = await response.json();
      console.log(data);
      setChargers(data.fuel_stations); // Set the charger data
      return data.fuel_stations;
    };

    useEffect(() => {
        fetchChargers();
    }, [contract]);


    const addCharger = async (newDevice: Device) => {
        if (contract) {
            try {
                const tx = await contract.addCharger(
                    newDevice.manufacturer,
                    newDevice.model,
                    newDevice.energyCapacity,
                    newDevice.status,
                    newDevice.firmwareVersion,
                    newDevice.softwareVersion,
                    newDevice.connectorType,
                    newDevice.location.latitude,
                    newDevice.location.longitude,
                    newDevice.location.zipCode
                );
                await tx.wait();
                console.log('Charger added successfully', tx);
               // fetchChargers(); // Fetch updated list of chargers
            } catch (error) {
                console.error('Error adding charger:', error);
            }
        }
    };

    const addMarkersToMap = (devicesToShow: Device[]) => {
        if (map) {
            markers.forEach(marker => marker.remove());
            const newMarkers: mapboxgl.Marker[] = [];

            devicesToShow.forEach(device => {
                if (device.location && !isNaN(device.location.longitude) && !isNaN(device.location.latitude)) {
                    const popupContent = `
                        <div class="popup-content">
                            <h3>${device.manufacturer} - ${device.model}</h3>
                            <div>
                                <p><strong>Status:</strong> ${device.status}</p>
                                <p><strong>Energy Capacity:</strong> ${device.energyCapacity}</p>
                                <p><strong>Connector Type:</strong> ${device.connectorType}</p>
                                <p><strong>Location:</strong> ${device.location.zipCode} (${device.location.latitude}, ${device.location.longitude})</p>
                            </div>
                        </div>
                    `;

                    const marker = new mapboxgl.Marker()
                        .setLngLat([device.location.longitude, device.location.latitude])
                        .setPopup(new mapboxgl.Popup().setHTML(popupContent))
                        .addTo(map);

                    newMarkers.push(marker);
                } else {
                    console.error(`Invalid or missing location for device ${device.manufacturer} - ${device.model}`);
                }
            });

            setMarkers(newMarkers);
        }
    };

    const handleZoomIn = () => {
        if (map) map.zoomIn();
    };

    const handleZoomOut = () => {
        if (map) map.zoomOut();
    };

    /* Form Handler part  */ 
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setSearchTerm(value);
        setFilteredDevices(devices.filter(device => device.manufacturer.toLowerCase().includes(value.toLowerCase())));
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDeviceInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const latitude = parseFloat(deviceInfo.lat);
        const longitude = parseFloat(deviceInfo.long);
        const power = parseFloat(deviceInfo.power);

        if (isNaN(latitude) || isNaN(longitude) || isNaN(power)) {
            console.error('Invalid latitude, longitude, or power');
            return;
        }

        const newDevice = {
            // name: deviceInfo.name,
            manufacturer: deviceInfo.manufacturer,
            model: deviceInfo.model,
            energyCapacity: deviceInfo.energyCapacity,
            status: deviceInfo.status,
            firmwareVersion: deviceInfo.firmwareVersion,
            softwareVersion: deviceInfo.softwareVersion,
            connectorType: deviceInfo.connectorType,
            location: {
                latitude,
                longitude,
                zipCode: deviceInfo.zipCode
            }
        };
        await addCharger(newDevice);

        setDevices([...devices, newDevice]);
                setFilteredDevices([...devices, newDevice]);
                addMarkersToMap([...devices, newDevice]);

                setDeviceInfo({
                 
                    manufacturer: '',
                    model: '',
                    energyCapacity: '',
                    status: '',
                    firmwareVersion: '',
                    softwareVersion: '',
                    connectorType: '',
                    power: '',
                    lat: '',
                    long: '',
                    zipCode: '',
                });    
    };

     // When a device in the list is clicked, zoom into its location and show its popup
     const handleDeviceClick = (device: Device) => {
      console.log(device)
        if (map && device.location) {
            // Fly to the selected device location on the map
            map.flyTo({
                center: [device.location.longitude, device.location.latitude],
                zoom: 14,
                essential: true // this ensures the animation is smooth and not interrupted
            });

            // Find the corresponding marker and show the popup
            const deviceMarker = markers.find(marker =>
                marker.getLngLat().lng === device.location.longitude && marker.getLngLat().lat === device.location.latitude
            );

            if (deviceMarker) {
                deviceMarker.getPopup()?.addTo(map); // Show the popup for the selected marker
            }
        }
    };

    const handleShowDetails = (device: Device) => {
        setSelectedDevice(device);
        setIsModalOpen(true); // Show the modal with device details
    };

    const handleCloseModal = () => {
        setSelectedDevice(null);
        setIsModalOpen(false);
    };

    return (
        <div className="relative h-screen w-full">
            <div id="map" className="absolute inset-0 w-full h-full"></div>
             {/* Zoom control buttons */}
             <div className="absolute bottom-5 right-10 bottom-5 flex space-x-4 bg-white bg-opacity-80 backdrop-blur-md rounded-full">
                <button
                    className="bg-transparent text-blue-500 p-2 rounded-full shadow-md transition-all text-2xl hover:text-blue-700"
                    onClick={handleZoomIn}
                >
                    +
                </button>

                <button
                    className="bg-transparent text-blue-500 p-2 rounded-full shadow-md transition-all text-2xl hover:text-blue-700"
                    onClick={handleZoomOut}
                >
                    -
                </button>
            </div>

            {/* Reduced size for form panel on the left */}
            {selectedDevice && (
                <Dialog open={isModalOpen} onClose={handleCloseModal} className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true"></div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow-2xl max-w-lg w-full p-8"
                        >
                            {/* Header with title and close button */}
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">Charger Information</h2>
                                <button
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    onClick={handleCloseModal}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Content with charger details */}
                            <div className="space-y-4">
                                <div className="p-4 bg-white bg-opacity-50 rounded-lg shadow-inner">
                                    <p className="text-lg font-semibold text-gray-600">Manufacturer</p>
                                    <p className="text-gray-800">{selectedDevice.manufacturer}</p>
                                </div>

                                <div className="p-4 bg-white bg-opacity-50 rounded-lg shadow-inner">
                                    <p className="text-lg font-semibold text-gray-600">Model</p>
                                    <p className="text-gray-800">{selectedDevice.model}</p>
                                </div>

                                <div className="p-4 bg-white bg-opacity-50 rounded-lg shadow-inner">
                                    <p className="text-lg font-semibold text-gray-600">Status</p>
                                    <p className="text-gray-800">{selectedDevice.status}</p>
                                </div>

                                <div className="p-4 bg-white bg-opacity-50 rounded-lg shadow-inner">
                                    <p className="text-lg font-semibold text-gray-600">Energy Capacity</p>
                                    <p className="text-gray-800">{selectedDevice.energyCapacity}</p>
                                </div>

                                <div className="p-4 bg-white bg-opacity-50 rounded-lg shadow-inner">
                                    <p className="text-lg font-semibold text-gray-600">Location</p>
                                    <p className="text-gray-800">
                                        {selectedDevice.location.zipCode} ({selectedDevice.location.latitude}, {selectedDevice.location.longitude})
                                    </p>
                                </div>

                                {/* <div className="p-4 bg-white bg-opacity-50 rounded-lg shadow-inner">
                                    <p className="text-lg font-semibold text-gray-600">Transaction Details</p>
                                    <p className="text-gray-800">Hash: {selectedDevice.onChainData.transactionHash}</p>
                                    <p className="text-gray-800">Block Number: {selectedDevice.onChainData.blockNumber}</p>
                                    <p className="text-gray-800">
                                        Timestamp: {new Date(selectedDevice.onChainData.timestamp).toLocaleString()}
                                    </p>
                                    <a
                                        href={selectedDevice.onChainData.vppScanUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-600 underline"
                                    >
                                        View on Chain
                                    </a>
                                </div> */}
                            </div>
                        </motion.div>
                    </div>
                </Dialog>
            )}

            <motion.div
                initial={{ opacity: 0, x: '-100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '-100%' }}
                className="absolute top-10  left-5 w-full max-w-xs bg-white bg-opacity-80 backdrop-blur-md p-4 shadow-md rounded-lg"
            >
                <h2 className="text-xl font-bold mb-4">Add New Charger</h2>
                <form onSubmit={handleFormSubmit} className="space-y-2">
                   
                    <input 
                        className="w-full p-2 border rounded" 
                        name="manufacturer" 
                        placeholder="Manufacturer" 
                        value={deviceInfo.manufacturer} 
                        onChange={handleFormChange} 
                        required 
                    />
                    <input 
                        className="w-full p-2 border rounded" 
                        name="model" 
                        placeholder="Model" 
                        value={deviceInfo.model} 
                        onChange={handleFormChange} 
                        required 
                    />
                    <input 
                        className="w-full p-2 border rounded" 
                        name="energyCapacity" 
                        placeholder="Energy Capacity" 
                        value={deviceInfo.energyCapacity} 
                        onChange={handleFormChange} 
                        required 
                    />
                    <input 
                        className="w-full p-2 border rounded" 
                        name="status" 
                        placeholder="Status" 
                        value={deviceInfo.status} 
                        onChange={handleFormChange} 
                        required 
                    />
                    <input 
                        className="w-full p-2 border rounded" 
                        name="firmwareVersion" 
                        placeholder="Firmware Version" 
                        value={deviceInfo.firmwareVersion} 
                        onChange={handleFormChange} 
                        required 
                    />
                    <input 
                        className="w-full p-2 border rounded" 
                        name="softwareVersion" 
                        placeholder="Software Version"
                        value={deviceInfo.softwareVersion} 
                        onChange={handleFormChange} 
                        required 
                    />
                    <input 
                        className="w-full p-2 border rounded" 
                        name="connectorType" 
                        placeholder="Connector Type" 
                        value={deviceInfo.connectorType} 
                        onChange={handleFormChange} 
                        required 
                    />
                    <input 
                        className="w-full p-2 border rounded" 
                        name="lat" 
                        placeholder="Latitude" 
                        type="number" 
                        value={deviceInfo.lat} 
                        onChange={handleFormChange} 
                        required 
                    />
                    <input 
                        className="w-full p-2 border rounded" 
                        name="long" 
                        placeholder="Longitude" 
                        type="number" 
                        value={deviceInfo.long} 
                        onChange={handleFormChange} 
                        required 
                    />
                    <input 
                        className="w-full p-2 border rounded" 
                        name="zipCode" 
                        placeholder="Zipcode" 
                        value={deviceInfo.zipCode} 
                        onChange={handleFormChange} 
                        required 
                    />
                    <input 
                        className="w-full p-2 border rounded" 
                        name="power" 
                        placeholder="Power (kW)" 
                        type="number" 
                        value={deviceInfo.power} 
                        onChange={handleFormChange} 
                        required 
                    />
                    
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Add Charger</button>
                </form>
            </motion.div>

            {/* Device List panel on the right */}
            <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                className="absolute top-10 right-10 w-full max-w-sm bg-white bg-opacity-80 backdrop-blur-md p-6 shadow-md "
            >
                <h3 className="text-2xl font-semibold mb-4">All Chargers</h3>
                <input
                    type="text"
                    placeholder="Search chargers..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded mb-4"
                />
                <ul className="space-y-2">
                    {filteredDevices.map((device, key) => (
                        <li
                        key={key}
                        className="bg-gray-100 p-3 rounded cursor-pointer hover:bg-gray-200 relative group"  // Added 'relative' and 'group' class
                        onClick={() => handleDeviceClick(device)}
                    >
                        <h4 className="text-lg font-semibold">{device.manufacturer} - {device.model}</h4>
                        <p>{device.status}</p>
                    
                        {/* Detail button appears on hover */}
                        <button
                            className="absolute top-3 right-3 text-sm bg-blue-500 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); handleShowDetails(device); }} // Added stopPropagation to avoid clicking the list item
                        >
                            Details
                        </button>
                    </li>
                    
                    ))}
                </ul>
            </motion.div>
        </div>
    );
};

export default Map;
