# ArgusConsumerApp

**Display Name:** Argus
**Platform:** React Native (Android & iOS)
**React Native Version:** 0.81.x
**GitHub Repository:** [argus-consumer-app](https://github.com/KOS-INC/argus-consumer-app)
**Primary Branch:** `dev`
**Node Requirement:** >= 20

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [Available Scripts](#available-scripts)
- [Android Build Commands](#android-build-commands)
- [Bluetooth & Native Permissions](#bluetooth--native-permissions)
- [Patches](#patches)
- [Troubleshooting](#troubleshooting)
- [Learn More](#learn-more)

---

## Project Overview

ArgusConsumerApp is a React Native application for glucose monitoring using Bluetooth Low Energy (BLE) sensors. This document serves as a single source of truth for developers and clients, covering setup, architecture, dependencies, and operational guidelines.

---

## Tech Stack

- **Frontend Framework:** React Native
- **Language:** TypeScript
- **State Management:** React Query
- **Navigation:** React Navigation (Bottom Tabs, Stack)
- **Bluetooth:** react-native-ble-plx
- **UI Libraries:**
  - react-native-paper
  - react-native-vector-icons
  - react-native-svg
- **Animations:** react-native-reanimated
- **Storage:** AsyncStorage, react-native-fs
- **Testing:** Jest

---

## Project Structure

```
root/
├── android/              # Android native code
├── ios/                  # iOS native code
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React Context providers
│   ├── utils/            # Utility functions
│   ├── services/         # API and service integrations
│   ├── integrations/     # Third-party integrations
│   ├── assets/           # Images, fonts, icons
│   └── config/           # Configuration files
├── patches/              # patch-package fixes
├── scripts/              # Build and utility scripts
├── App.tsx               # Root component
├── index.js              # Entry point
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── babel.config.js       # Babel config
├── metro.config.js       # Metro bundler config
└── README.md             # This file
```

---

## Environment Setup

### Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** >= 20
- **Java JDK** 17+
- **Android Studio** (with Android SDK and Emulator)
- **Xcode** (for iOS development, macOS only)
- **CocoaPods** (for iOS dependencies)

> **Note:** Complete the [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Install Dependencies

```sh
npm install
```

⚠️ **Important:** `patch-package` runs automatically after install to apply necessary fixes.

---

## Running the Project

### Check Device Connection

Connect your device via USB and verify it's detected:

```sh
adb devices
```

### Start Metro Server

Metro is the JavaScript bundler for React Native. Start it with:

```sh
npm start
```

### Run on Android

With Metro running, open a new terminal and run:

```sh
npm run android
```

### Run on iOS

First, install CocoaPods dependencies (required on first clone or after updating native dependencies):

```sh
bundle install
bundle exec pod install
```

Then run the app:

```sh
npm run ios
```

If everything is set up correctly, you should see the app running on your device or emulator.

---

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm start` | Start Metro bundler |
| `npm run android` | Run Android app on connected device/emulator |
| `npm run ios` | Run iOS app on simulator/device |
| `npm test` | Run Jest tests |
| `npm run release:a` | Build release APK for Android |
| `npm run debug:a` | Build debug APK for Android |
| `npm run build:a` | Build Android App Bundle (AAB) for Play Store |
| `npm run u:apk` | Uninstall debug APK from device |
| `npm run sync:fonts` | Sync fonts and icons to project |

---

## Android Build Commands

### `npm run release:a`
Creates a **release APK** file that can be shared and installed on devices.

```sh
npm run release:a
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

**Use case:** Share the APK with testers or users for direct installation.

---

### `npm run debug:a`
Creates a **debug APK** for local testing on devices.

```sh
npm run debug:a
```

**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

**Use case:** Testing locally with debugging capabilities enabled.

---

### `npm run build:a`
Creates an **Android App Bundle (AAB)** file for uploading to Google Play Store.

```sh
npm run build:a
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

**Use case:** Upload to Google Play Console for distribution. AAB files are optimized and smaller than APKs.

---

### `npm run u:apk`
Uninstalls the existing debug APK from connected devices.

```sh
npm run u:apk
```

**Use case:** Clean installation before reinstalling with `npm run android`.

---

### `npm run sync:fonts`
Synchronizes fonts and icons to the project.

```sh
npm run sync:fonts
```

**Use case:** Run after adding new fonts or icons to ensure they're properly linked.

---

### Build Workflow Examples

#### For Testing on Device
```sh
# 1. Uninstall old debug version (if exists)
npm run u:apk

# 2. Install fresh debug build
npm run android
```

#### For Sharing with Testers
```sh
# Generate release APK
npm run release:a

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

#### For Play Store Upload
```sh
# Generate AAB file
npm run build:a

# AAB location: android/app/build/outputs/bundle/release/app-release.aab
```

---

## Bluetooth & Native Permissions

This app requires Bluetooth Low Energy (BLE) permissions to communicate with glucose monitoring sensors.

### Android Permissions

The following permissions are declared in `AndroidManifest.xml`:

- `BLUETOOTH_SCAN` - Scan for BLE devices
- `BLUETOOTH_CONNECT` - Connect to BLE devices
- `ACCESS_FINE_LOCATION` - Required for BLE scanning on Android

### iOS Permissions

The following permissions are declared in `Info.plist`:

- `NSBluetoothAlwaysUsageDescription` - Bluetooth usage description
- `NSLocationWhenInUseUsageDescription` - Location usage description

⚠️ **These permissions are mandatory for BLE communication.**

---

## Patches

This project uses `patch-package` to fix third-party library issues without waiting for upstream releases.

### Why Patches Are Used

- Fix crashes or bugs in `node_modules`
- Apply critical fixes immediately
- Maintain stability while waiting for official library updates

### Current Patches

- **react-native-ble-plx**
  - Fixes Android `NullPointerException` during BLE error handling
  - Location: `patches/react-native-ble-plx+3.2.1.patch`

### How Patches Are Applied

Patches are automatically applied after `npm install` via the postinstall script:

```json
"postinstall": "node scripts/applyPatches.js"
```

### Regenerating a Patch

If you need to modify or recreate a patch:

```sh
npx patch-package react-native-ble-plx
```

⚠️ **Never delete the `patches/` folder** - it contains critical fixes.

For more details, see `patches/README.md`.

---

## Troubleshooting

### BLE Stops Working
- Reinstall the app
- Check that all Bluetooth permissions are granted
- Ensure Bluetooth is enabled on the device

### Build Fails on Android
Clean the build and try again:

```sh
cd android
gradlew clean
cd ..
npm run android
```

### iOS Build Issues
Delete Pods and reinstall:

```sh
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install
cd ..
npm run ios
```

### Metro Bundler Issues
Reset Metro cache:

```sh
npm start -- --reset-cache
```

### App Crashes on Launch
- Check native logs: `adb logcat` (Android) or Xcode console (iOS)
- Ensure all patches are applied: `npm install`
- Verify permissions are granted in device settings

For more troubleshooting tips, see the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting).

---

## Learn More

### React Native Resources

- [React Native Website](https://reactnative.dev) - Official documentation
- [Getting Started](https://reactnative.dev/docs/environment-setup) - Environment setup guide
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - Guided tour of React Native basics
- [React Native Blog](https://reactnative.dev/blog) - Latest updates and announcements
- [GitHub Repository](https://github.com/facebook/react-native) - Open source React Native code

### Project-Specific Resources

- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
- [react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx) - BLE library documentation
- [React Query Docs](https://tanstack.com/query/latest) - Data fetching and state management

---

## Development Guidelines

### Fast Refresh

When you save changes to your code, the app automatically updates via Fast Refresh. To force a full reload:

- **Android:** Press <kbd>R</kbd> twice or <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) / <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS) to open Dev Menu
- **iOS:** Press <kbd>R</kbd> in iOS Simulator

### Code Quality

- Follow TypeScript best practices
- Write tests for critical functionality
- Use ESLint and Prettier for code formatting
- Review patches before updating dependencies

---

**Document Owner:** Development Team
**Last Updated:** February 2026

---

For questions or issues, please contact the development team or open an issue on the [GitHub repository](https://github.com/KOS-INC/argus-consumer-app).
