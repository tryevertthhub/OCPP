import { NextResponse } from 'next/server';

interface OnChainData {
    transactionHash: string;
    timestamp: string;
    blockNumber: number;
    vppScanUrl: string;
}

interface Device {
    id: number;
    name: string;
    location: {
        latitude: number;
        longitude: number;
        zipCode: string;
    };
    details: string;
    power: number;
    manufacturer: string;
    model: string;
    status: string;
    firmwareVersion: string;
    softwareVersion: string;
    connectorType: string; // Added connectorType
    energyCapacity: string; // Added energyCapacity
    onChainData: OnChainData;
}

const devices: Device[] = [
    {
        id: 1,
        name: 'Charger 1',
        location: {
            latitude: 34.0522,
            longitude: -118.2437,
            zipCode: '90001',
        },
        details: 'Connected',
        power: 50,
        manufacturer: 'Wallbox',
        model: 'Pulsar Plus 48A',
        status: 'Available',
        firmwareVersion: '1.2.4',
        softwareVersion: '2.3.1',
        connectorType: 'CCS',
        energyCapacity: '48A',
        onChainData: {
            transactionHash: '0xabc123',
            timestamp: '2024-10-20T12:34:56Z',
            blockNumber: 123456,
            vppScanUrl: 'https://vppscan.com/tx/0xabc123',
        },
    },
    {
        id: 2,
        name: 'Charger 2',
        location: {
            latitude: 40.7128,
            longitude: -74.0060,
            zipCode: '10001',
        },
        details: 'Connected',
        power: 75,
        manufacturer: 'Tesla',
        model: 'Supercharger V3',
        status: 'Charging',
        firmwareVersion: '2.1.0',
        softwareVersion: '3.0.2',
        connectorType: 'CHAdeMO',
        energyCapacity: '250kW',
        onChainData: {
            transactionHash: '0xdef456',
            timestamp: '2024-10-21T14:45:10Z',
            blockNumber: 123789,
            vppScanUrl: 'https://vppscan.com/tx/0xdef456',
        },
    },
    {
        id: 3,
        name: 'Charger 3',
        location: {
            latitude: 51.5074,
            longitude: -0.1278,
            zipCode: 'EC1A 1BB',
        },
        details: 'Disconnected',
        power: 60,
        manufacturer: 'ChargePoint',
        model: 'Express Plus',
        status: 'Available',
        firmwareVersion: '3.2.1',
        softwareVersion: '4.5.1',
        connectorType: 'Type 2',
        energyCapacity: '100kW',
        onChainData: {
            transactionHash: '0xghi789',
            timestamp: '2024-10-22T10:20:30Z',
            blockNumber: 124000,
            vppScanUrl: 'https://vppscan.com/tx/0xghi789',
        },
    },
    {
        id: 4,
        name: 'Charger 4',
        location: {
            latitude: 48.8566,
            longitude: 2.3522,
            zipCode: '75001',
        },
        details: 'Connected',
        power: 80,
        manufacturer: 'EVBox',
        model: 'Ultroniq',
        status: 'Charging',
        firmwareVersion: '4.0.1',
        softwareVersion: '5.2.3',
        connectorType: 'CCS',
        energyCapacity: '350kW',
        onChainData: {
            transactionHash: '0xjkl012',
            timestamp: '2024-10-23T16:12:45Z',
            blockNumber: 124123,
            vppScanUrl: 'https://vppscan.com/tx/0xjkl012',
        },
    },
    {
        id: 5,
        name: 'Charger 5',
        location: {
            latitude: 35.6895,
            longitude: 139.6917,
            zipCode: '100-0001',
        },
        details: 'Disconnected',
        power: 100,
        manufacturer: 'ABB',
        model: 'Terra 54',
        status: 'Available',
        firmwareVersion: '5.1.3',
        softwareVersion: '6.0.0',
        connectorType: 'CHAdeMO',
        energyCapacity: '125kW',
        onChainData: {
            transactionHash: '0xmnq345',
            timestamp: '2024-10-24T18:30:50Z',
            blockNumber: 124456,
            vppScanUrl: 'https://vppscan.com/tx/0xmnq345',
        },
    },
];

// Simulated Dione L1 storage integration (for the Registry Service)
async function storeOnDione(device: Device) {
    // Simulate storing the device on the Dione L1 chain (testnet)
    console.log('Storing device on Dione L1:', device);
    return { success: true, device };
}

// GET method to retrieve devices
export async function GET() {
    return NextResponse.json(devices);
}

// POST method to add a new device and store it on-chain
export async function POST(request: Request) {
    try {
        // Expect location object with latitude, longitude, and zipCode from frontend
        const {
            name,
            location: { latitude, longitude, zipCode }, // Destructure location
            details,
            power,
            manufacturer,
            model,
            status,
            firmwareVersion,
            softwareVersion,
            connectorType, // Expect connectorType from frontend
            energyCapacity, // Expect energyCapacity from frontend
        } = await request.json();

        console.log("Received input:", {
            name,
            latitude,
            longitude,
            details,
            zipCode,
            power,
            manufacturer,
            model,
            status,
            firmwareVersion,
            softwareVersion,
            connectorType,
            energyCapacity
        });

        // Validate fields
        if (
            !name ||
            isNaN(latitude) ||
            isNaN(longitude) ||
            !zipCode ||
            isNaN(power) ||
            !manufacturer ||
            !model ||
            !status ||
            !firmwareVersion ||
            !softwareVersion ||
            !connectorType ||
            !energyCapacity
        ) {
            return NextResponse.json({ message: 'Invalid device data' }, { status: 400 });
        }

        const newDevice: Device = {
            id: devices.length + 1,
            name,
            location: {
                latitude,
                longitude,
                zipCode,
            },
            details: details || 'Connected',
            power: Number(power),
            manufacturer,
            model,
            status,
            firmwareVersion,
            softwareVersion,
            connectorType, // Store connectorType
            energyCapacity, // Store energyCapacity
            onChainData: {
                transactionHash: `0x${Math.random().toString(36).substr(2, 10)}`,
                timestamp: new Date().toISOString(),
                blockNumber: Math.floor(Math.random() * 1000000),
                vppScanUrl: `https://vppscan.com/tx/0x${Math.random().toString(36).substr(2, 10)}`,
            },
        };

        // Simulate storing the device on the Dione L1 chain
        const onChainResult = await storeOnDione(newDevice);

        if (onChainResult.success) {
            devices.push(newDevice);

            return NextResponse.json(newDevice, { status: 201 });
        } else {
            return NextResponse.json({ message: 'Failed to store device on chain' }, { status: 500 });
        }
    } catch (error) {
        console.error("Error:", error);
        
        return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }
}
