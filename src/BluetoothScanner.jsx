import { useEffect, useState } from 'react';
import { BluetoothLe, BleClient } from '@capacitor-community/bluetooth-le';

function BluetoothScanner() {
	const [devices, setDevices] = useState([]);
	const [connectedDevice, setConnectedDevice] = useState(null);
	const [connectedDeviceId, setConnectedDeviceId] = useState(null);
	const [isScanning, setIsScanning] = useState(false);
	const [pairingDeviceId, setPairingDeviceId] = useState(null);
	const [connectedDevices, setConnectedDevices] = useState([]);

	const initBluetooth = async () => {
		await BluetoothLe.initialize();
		console.log('Bluetooth initialized');
	};

	useEffect(() => {
		initBluetooth();

		return () => {
			BluetoothLe.stopScan().catch((err) => console.warn('Stop scan error:', err));
		};
	}, []);

	const scanDevices = async () => {
		setDevices([]);
		setIsScanning(true);
		try {
			await BleClient.initialize();
			await BleClient.requestLEScan({}, (device) => {
				setDevices((prev) => {
					const exists = prev.some((d) => d.device.deviceId === device.device.deviceId);
					return exists ? prev : [...prev, device];
				});
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

	useEffect(() => {
		scanDevices();
	}, []);

	const requestPermissions = async () => {
		try {
			initBluetooth();
			const result = await BluetoothLe.requestPermissions();

			console.log('Permissions result:', result);
		} catch (error) {
			console.error('Permission error:', error);
		}
	};

	const startScan = async () => {
		console.log('Scanned started');
		setDevices([]);
		try {
			initBluetooth();
			await BluetoothLe.requestLEScan({ services: [] }, (result) => {
				console.log('Scanned device:', result);
				setDevices((prev) => {
					const exists = prev.some((d) => d.device.deviceId === result.device.deviceId);
					return exists ? prev : [...prev, result];
				});
			});
		} catch (error) {
			console.error('Scan error:', error);
		}
	};

	// const connectToDevice = async (deviceId, deviceName) => {
	// 	try {
	// 		if (pairingDeviceId) return;

	// 		if (connectedDeviceId === deviceId) {
	// 			try {
	// 				await BluetoothLe.disconnect({ deviceId });
	// 				setConnectedDeviceId(null);
	// 				console.log(`Disconnected from ${deviceId}`);
	// 				alert(`Disconnected to device: ${deviceName}`);
	// 			} catch (error) {
	// 				console.error('Disconnection failed:', error);
	// 			}
	// 			return;
	// 		}
	// 		setPairingDeviceId(deviceId);
	// 		const result = await BluetoothLe.connect({ deviceId });
	// 		console.log('Connected to:', result);
	// 		setConnectedDevice(deviceName || deviceId);
	// 		setConnectedDeviceId(deviceId);
	// 		alert(`Connected to device: ${deviceName}`);
	// 		setPairingDeviceId(null);
	// 	} catch (error) {
	// 		console.error('Connection failed:', error);
	// 		setPairingDeviceId(null);
	// 		alert(`Connection Unsuccessful. Make sure the "${deviceName}" is turned on and in range.`);
	// 		if (connectedDeviceId) return;
	// 		setConnectedDeviceId(null);
	// 		setConnectedDevice(null);
	// 	}
	// };

	const connectToDevice = async (deviceId, deviceName) => {
		try {
			if (pairingDeviceId) return;

			const isAlreadyConnected = connectedDevices.some((d) => d.id === deviceId);

			if (isAlreadyConnected) {
				// Disconnect logic
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
			alert(`Connected to device: ${deviceName}`);
			setPairingDeviceId(null);
		} catch (error) {
			console.error('Connection failed:', error);
			setPairingDeviceId(null);
			alert(`Connection Unsuccessful. Make sure the "${deviceName}" is turned on and in range.`);
		}
	};

	return (
		<div style={{ padding: 20, fontFamily: 'Roboto, sans-serif', background: '#f2f2f2', minHeight: '100vh' }}>
			<h2 style={{ color: '#333', fontSize: 24, marginBottom: 20 }}>🔍 Bluetooth Scanner</h2>

			<div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
				<button
					onClick={requestPermissions}
					style={{
						padding: '10px 16px',
						backgroundColor: '#1976d2',
						color: 'white',
						border: 'none',
						borderRadius: 6,
						cursor: 'pointer',
					}}>
					Request Permission
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

			<h3 style={{ fontSize: 20, color: '#555', marginBottom: 10 }}>📱 Devices Found:</h3>
			{isScanning && <div style={{ marginTop: 30, textAlign: 'center', color: '#888', position: 'relative', bottom: 10 }}>🔄 Scanning for devices...</div>}

			<ul style={{ padding: 0 }}>
				{devices.length === 0 && !isScanning && <p style={{ color: '#999' }}>No devices found yet.</p>}
				{devices
					.filter((d) => d.device?.name)
					.map((d, i) => {
						const isConnecting = pairingDeviceId === d.device.deviceId;
						// const isConnected = connectedDeviceId === d.device.deviceId;
						const isConnected = connectedDevices.some((dev) => dev.id === d.device.deviceId);

						return (
							<li
								key={i}
								onClick={() => !isConnecting && connectToDevice(d.device.deviceId, d.device?.name)}
								style={{
									listStyleType: 'none',
									marginBottom: 10,
									backgroundColor: 'white',
									padding: 15,
									borderRadius: 8,
									boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'flex-start',
									cursor: isConnecting || isConnected ? 'default' : 'pointer',
									opacity: isConnecting ? 0.6 : 1,
								}}>
								<div>
									<div style={{ fontWeight: 'bold', color: isConnected ? '#2e7d32' : '#000', alignItems: 'flex-start' }}>{d.device?.name || 'Unnamed Device'}</div>
									<div style={{ fontSize: 14, color: '#666', alignItems: 'flex-start' }}>{d.device.deviceId}</div>
								</div>
								<div>
									<div style={{ fontWeight: 'bold', color: isConnected ? '#2e7d32' : '#555', alignItems: 'flex-end' }}>{isConnected ? 'Connected' : ' '}</div>
									<div style={{ fontWeight: 'bold', color: isConnected ? '#2e7d32' : '#555', alignItems: 'flex-end' }}>{!isConnected && isConnecting ? 'Pairing…' : ' '}</div>
								</div>
							</li>
						);
					})}
			</ul>
		</div>
	);
}

export default BluetoothScanner;
