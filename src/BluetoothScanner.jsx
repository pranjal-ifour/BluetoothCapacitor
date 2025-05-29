import { useEffect, useState } from 'react';
import { BluetoothLe, BleClient } from '@capacitor-community/bluetooth-le';

function BluetoothScanner() {
	const [devices, setDevices] = useState([]);
	const [isScanning, setIsScanning] = useState(false);
	const [isReadingData, setIsReadingData] = useState(false);
	const [pairingDeviceId, setPairingDeviceId] = useState(null);
	const [connectedDevices, setConnectedDevices] = useState([]);
	const [readData, setReadData] = useState([]);

	// Initialize Bluetooth LE
	const initBluetooth = async () => {
		await BluetoothLe.initialize();
		console.log('Bluetooth initialized');
	};

	// Initialize Bluetooth on component mount
	// This will also stop any ongoing scans when the component unmounts
	useEffect(() => {
		initBluetooth();

		return () => {
			BluetoothLe.stopLEScan().catch((err) => console.warn('Stop scan error:', err));
		};
	}, []);

	// Function to scan for devices
	// This will scan for devices and automatically connect to a specific device if found
	const scanDevices = async () => {
		setDevices([]);
		setReadData([]);
		setIsScanning(true);
		try {
			await BleClient.initialize();
			// to scan for all devices
			// await BleClient.requestLEScan({}, (device) => {
			// 	setDevices((prev) => {
			// 		const exists = prev.some((d) => d.device.deviceId === device.device.deviceId);
			// 		return exists ? prev : [...prev, device];
			// 	});
			// });

			// to scan for all devices and connect with particular device automatically
			await BleClient.requestLEScan({}, async (device) => {
				const alreadyExists = devices.some((d) => d.device.deviceId === device.device.deviceId);
				if (!alreadyExists) {
					setDevices((prev) => [...prev, device]);
				}

				if (device?.device?.name === 'Evolve3_4260') {
					console.log('🔍 Auto-connecting to Evolve3_4260...');
					await BleClient.stopLEScan();
					setIsScanning(false);

					// Delay slightly to ensure device is ready
					setTimeout(() => {
						connectToDevice(device.device.deviceId, device.device.name);
					}, 500);
				}
			});

			setTimeout(async () => {
				await BleClient.stopLEScan();
				setIsScanning(false);
			}, 10000);
		} catch (error) {
			console.error(error);
			setIsScanning(false);
		}
	};

	// Automatically scan for devices on component mount
	useEffect(() => {
		scanDevices();
	}, []);

	// Function to connect to a device
	// If already connected, it will disconnect
	const connectToDevice = async (deviceId, deviceName) => {
		try {
			if (pairingDeviceId) return;

			const isAlreadyConnected = connectedDevices.some((d) => d.id === deviceId);

			if (isAlreadyConnected) {
				try {
					await BluetoothLe.disconnect({ deviceId });
					setConnectedDevices((prev) => prev.filter((d) => d.id !== deviceId));
					console.log(`Disconnected from ${deviceId}`);
					alert(`Disconnected from device: ${deviceName}`);
				} catch (error) {
					console.error('Disconnection failed:', error);
				}
				return;
			}

			setPairingDeviceId(deviceId);
			const result = await BluetoothLe.connect({ deviceId });
			console.log('Connected to:', result);
			setConnectedDevices((prev) => [...prev, { id: deviceId, name: deviceName || deviceId }]);
			await readDeviceInfo(deviceId);
			setPairingDeviceId(null);
		} catch (error) {
			console.error('Connection failed:', error);
			setPairingDeviceId(null);
			alert(`Connection Unsuccessful. Make sure the "${deviceName}" is turned on and in range.`);
		}
	};

	// Function to read data from connected devices
	const handleRead = async () => {
		if (connectedDevices.length === 0) {
			alert('No devices connected. Please connect to a device first.');
			return;
		}
		setIsReadingData(true);
		const deviceId = connectedDevices[0].id; // Read from the first connected device
		const { services } = await BluetoothLe.getServices({ deviceId });

		if (services.length === 0) {
			alert('No services found on the connected device.');
			return;
		}

		await readAllFromGetServices(deviceId, services);
	};

	// Function to read all characteristics from the services of a connected device
	const readAllFromGetServices = async (deviceId, services) => {
		const results = [];

		for (const service of services) {
			const serviceUUID = service.uuid;

			for (const characteristic of service.characteristics) {
				const charUUID = characteristic.uuid;
				const props = characteristic.properties;
				if (props.read) {
					try {
						const result = await BluetoothLe.read({
							deviceId,
							service: serviceUUID,
							characteristic: charUUID,
						});

						if (result?.value) {
							console.log('text', result?.value);

							results.push({
								serviceUUID,
								charUUID,
								value: result?.value,
							});
						} else {
							results.push({
								serviceUUID,
								charUUID,
								value: '[No data]',
							});
						}
					} catch (err) {
						results.push({
							serviceUUID,
							charUUID,
							value: `[Error: ${err.message}]`,
						});
					}
				} else {
					if (serviceUUID.includes('180d')) {
						await BluetoothLe.startNotifications(
							{
								deviceId,
								service: serviceUUID,
								characteristic: charUUID,
							},
							(result) => {
								const valueBytes = Uint8Array.from(atob(result.value), (c) => c.charCodeAt(0));
								const heartRate = valueBytes[1]; // Usually in byte 1 or 2 depending on flags
								console.log('❤️ Heart Rate:', heartRate);
								results.push({
									serviceUUID,
									charUUID,
									value: heartRate,
								});
							}
						);
					}
				}
			}
		}

		// Update UI
		console.log('serviecs =>', results);
		setIsReadingData(false);
		setReadData(results);
	};

	// Function to read device information (Manufacturer, Model, Serial Number)
	const readDeviceInfo = async (deviceId) => {
		const characteristics = {
			manufacturer: '00002a29-0000-1000-8000-00805f9b34fb', // Replace with Manufacturer Name String starts with 0x2A29
			model: '00002a24-0000-1000-8000-00805f9b34fb', // Replace with Manufacturer Name String starts with 0x2A24
			serial: '00002a25-0000-1000-8000-00805f9b34fb', // Replace with Manufacturer Name String starts with 0x2A25
		};

		const service = '0000180a-0000-1000-8000-00805f9b34fb'; // Replace with Device Information Service UUID starts with 0x180A

		// Read characteristics from the Device Information Service
		const readCharacteristic = async (charUUID) => {
			try {
				const result = await BluetoothLe.read({ deviceId, service, characteristic: charUUID });
				return result.value;
			} catch {
				return '[Read Failed]';
			}
		};

		const manufacturer = await readCharacteristic(characteristics.manufacturer);
		const model = await readCharacteristic(characteristics.model);
		const serial = await readCharacteristic(characteristics.serial);

		console.log('manufacturer', manufacturer);
		console.log('model', model);
		console.log('serial', serial);

		return { manufacturer, model, serial };
	};

	return (
		<div style={{ fontFamily: 'Roboto, sans-serif', background: '#fff', minHeight: '100vh', textAlign: 'start' }}>
			<h2 style={{ color: '#333', fontSize: 24, marginBottom: 20, textAlign: 'center' }}>Bluetooth Scanner</h2>

			<div style={{ display: 'flex', gap: 10, marginBottom: 30, justifyContent: 'center' }}>
				<button
					style={{
						padding: '10px 16px',
						backgroundColor: '#4da6ff',
						color: 'white',
						border: 'none',
						borderRadius: 6,
						cursor: 'pointer',
					}}
					onClick={handleRead}>
					{isReadingData ? 'Reading...' : 'Read Data'}
				</button>
				<button
					onClick={scanDevices}
					style={{
						padding: '10px 16px',
						backgroundColor: '#43a047',
						color: 'white',
						border: 'none',
						borderRadius: 6,
						cursor: 'pointer',
					}}>
					{isScanning ? 'Scanning...' : 'Start Scan'}
				</button>
			</div>

			{readData?.length > 0 && (
				<div>
					<h2 style={{ fontWeight: 'bold', fontSize: '18px' }}>Read Characteristics: {connectedDevices[0].name}</h2>
					{readData.map((item, index) => (
						<div key={index} style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
							<p>
								🔧 <strong>Service:</strong> {item.serviceUUID}
							</p>
							<p>
								📍 <strong>Characteristic:</strong> {item.charUUID}
							</p>
							<p>
								📦 <strong>Value:</strong> {item.value}
							</p>
						</div>
					))}
				</div>
			)}

			<h3 style={{ fontSize: 20, color: '#555', marginBottom: 10 }}>📱 Devices Found:</h3>
			{isScanning && <div style={{ marginTop: 30, textAlign: 'center', color: '#888', position: 'relative', bottom: 10 }}>🔄 Scanning for devices...</div>}
			<ul style={{ padding: 0 }}>
				{devices.length === 0 && !isScanning && <p style={{ color: '#999' }}>No devices found yet.</p>}
				{devices
					.filter((d) => d.device?.name)
					.sort((a, b) => {
						const aConnected = connectedDevices?.some((dev) => dev.id === a.device.deviceId);
						const bConnected = connectedDevices?.some((dev) => dev.id === b.device.deviceId);
						return aConnected === bConnected ? 0 : aConnected ? -1 : 1;
					})
					.map((d, i) => {
						const isConnecting = pairingDeviceId === d.device.deviceId;
						const isConnected = connectedDevices.some((dev) => dev.id === d.device.deviceId);

						return (
							<li
								key={i}
								onClick={() => !isConnecting && connectToDevice(d.device.deviceId, d.device?.name)}
								style={{
									listStyleType: 'none',
									marginBottom: 10,
									backgroundColor: '#f2f2f2',
									padding: 15,
									borderRadius: 8,
									boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
									display: 'flex',
									gap: 10,
									cursor: isConnecting || isConnected ? 'default' : 'pointer',
									opacity: isConnecting ? 0.6 : 1,
								}}>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'flex-start',
										alignItems: 'flex-start',
									}}>
									<div style={{ fontWeight: 'bold', color: isConnected ? '#2e7d32' : '#000', alignItems: 'flex-start' }}>{d.device?.name || 'Unnamed Device'}</div>
									<div
										style={{
											display: 'flex',
											flexDirection: 'row',
											justifyContent: 'space-between',
											alignItems: 'center',
											gap: 20,
										}}>
										<div style={{ fontSize: 14, color: '#666', alignItems: 'flex-start', flex: 1, textAlign: 'left' }}>{d.device.deviceId}</div>
										<div style={{ fontWeight: 'bold', color: isConnected ? '#2e7d32' : '#555', alignItems: 'flex-end', flex: 1, textAlign: 'right' }}>{isConnected ? 'Connected' : isConnecting ? 'Pairing…' : ' '}</div>
									</div>
								</div>
							</li>
						);
					})}
			</ul>
		</div>
	);
}

export default BluetoothScanner;
