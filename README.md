# 🔵 React Bluetooth Scanner App

This is a React app powered by Capacitor that scans, connects, and manages multiple Bluetooth Low Energy (BLE) devices using the `@capacitor-community/bluetooth-le` plugin.

## 🚀 Features

- Scan for BLE devices nearby
- Connect to multiple BLE devices simultaneously
- Display connection status (Pairing, Connected)
- Disconnect from devices
- Filter unnamed devices

---

## 🛠️ Requirements

- Node.js (v16 or newer recommended)
- Android Studio (for running on emulator or physical Android device)
- A physical Android device with BLE for real testing
- Capacitor CLI

---

## 📦 Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/react-bluetooth-scanner.git
cd react-bluetooth-scanner

# 2. Install dependencies
npm install

# 3. Build the web app
npm run build

# 4. Add Android platform
npx cap add android

# 5. Sync Capacitor with Android
npx cap sync

# 6. Open Android project in Android Studio
npx cap open android


## 🍏 Run on iOS

> ⚠️ iOS requires a Mac with Xcode installed.

### 1. Install iOS platform

```bash
npx cap add ios
npx cap sync
npx cap open ios


