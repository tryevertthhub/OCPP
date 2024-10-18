import { NextResponse } from 'next/server';

interface Device {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    details: string;
}

// Mock database to hold devices
let devices: Device[] = [
    { id: 1, name: 'Charger 1', latitude: 34.0522, longitude: -118.2437, details: 'Connected' },
    { id: 2, name: 'Charger 2', latitude: 40.7128, longitude: -74.0060, details: 'Connected' },
];

// GET method to retrieve devices
export async function GET() {
    return NextResponse.json(devices);
}

// POST method to add a new device
export async function POST(request: Request) {
    const { name, latitude, longitude, details } = await request.json();

    // Basic validation
    if (!name || isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json({ message: 'Invalid device data' }, { status: 400 });
    }

    // Create a new device
    const newDevice: Device = {
        id: devices.length + 1, // Simple ID generation
        name,
        latitude,
        longitude,
        details: details || '', // Default to empty string if no details provided
    };

    // Add the new device to the "database"
    devices.push(newDevice);

    // Return the added device
    return NextResponse.json(newDevice, { status: 201 });
}
