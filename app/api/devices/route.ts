import { NextResponse } from 'next/server';

interface Device {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    details: string;
    zipCode: string;  // Adding zipCode field
    power: number;    // Adding power in kWh
}

const devices: Device[] = [
    { id: 1, name: 'Charger 1', latitude: 34.0522, longitude: -118.2437, details: 'Connected', zipCode: '90001', power: 50 },
    { id: 2, name: 'Charger 2', latitude: 40.7128, longitude: -74.0060, details: 'Connected', zipCode: '10001', power: 75 },
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
    const { name, latitude, longitude, details, zipCode, power } = await request.json();

    // Validate fields
    if (!name || isNaN(latitude) || isNaN(longitude) || !zipCode || isNaN(power)) {
        return NextResponse.json({ message: 'Invalid device data' }, { status: 400 });
    }

    const newDevice: Device = {
        id: devices.length + 1,
        name,
        latitude,
        longitude,
        details: details || 'Connected',
        zipCode,
        power: Number(power) // Ensure power is a number
    };

    try {
        // Store device on the Dione L1 chain
        const onChainResult = await storeOnDione(newDevice);

        if (onChainResult.success) {
            devices.push(newDevice);
            return NextResponse.json(newDevice, { status: 201 });
        } else {
            return NextResponse.json({ message: 'Failed to store device on chain' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ message: error}, { status: 500 });
    }
}
