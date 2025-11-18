# SnapTallyMobile - React Native App

A mobile shopping assistant that helps you track your cart total in real-time by scanning price tags.

## 🎉 Successfully Converted to React Native!

This app has been converted from a web application to a React Native mobile app using Expo.

## 📱 Features

- **Camera Scanning**: Use your phone's camera to scan price tags
- **Real-time Totals**: See your cart total update instantly
- **Session Management**: Start, resume, and track multiple shopping trips
- **Location Tracking**: Automatically detect your shopping location
- **Item Management**: Adjust quantities, remove items, and view history

## 🚀 Getting Started

### Prerequisites

- ✅ Node.js v24.11.0 (installed)
- ✅ npm v11.6.1 (installed)
- ✅ Android SDK & Android Studio (installed)
- ✅ Visual Studio 2022 with C++ tools (installed)

### Installation

Dependencies are already installed! If you need to reinstall:

```bash
npm install
```

### Running the App

#### Start Development Server
```bash
npm start
```

This will open the Expo DevTools. From there you can:
- Press `a` to open in Android emulator
- Press `w` to open in web browser (experimental)
- Scan QR code with Expo Go app on your phone

#### Run on Android Emulator
```bash
npm run android
```

#### Run on iOS Simulator (Mac only)
```bash
npm run ios
```

#### Run on Web (Experimental)
```bash
npm run web
```

## 📦 Project Structure

```
src/
├── screens/
│   ├── SessionStartScreen.tsx  - Start/resume shopping sessions
│   └── ShoppingScreen.tsx      - Main shopping interface
├── components/
│   ├── CameraCaptureNative.tsx - Camera functionality
│   └── ItemCardNative.tsx      - Item display component
├── navigation/
│   └── AppNavigator.tsx        - Navigation setup
├── lib/
│   ├── api.ts                  - API calls
│   ├── toast.ts                - Toast notifications
│   └── image-compression-native.ts - Image processing
├── styles/
│   └── theme.ts                - Design system
└── types/
    └── index.ts                - TypeScript types
```

## 🎨 Design System

The app uses a custom design system defined in `src/styles/theme.ts`:
- **Colors**: Primary blue theme with semantic colors
- **Typography**: Consistent font scales
- **Spacing**: 8px base grid system
- **Shadows**: iOS/Android compatible elevation
- **Border Radius**: Consistent rounded corners

## 🔧 Key Technologies

- **Expo ~52.0.0** - React Native framework
- **React Native 0.76.5** - Mobile framework
- **React Navigation 7** - Navigation library
- **Expo Camera** - Camera access
- **Expo Location** - GPS/location services
- **TanStack Query** - Data fetching & caching
- **TypeScript** - Type safety
- **Phosphor Icons** - Icon library

## 📸 Camera Permissions

The app requires camera and location permissions:
- **Camera**: For scanning price tags
- **Photos**: For selecting images from gallery
- **Location**: For detecting shop location

Permissions are requested at runtime when needed.

## 🌐 API Configuration

The app connects to the SnapTallyMobile API:
- **Base URL**: `https://dev-snaptally-api.redground-640c9f9b.australiaeast.azurecontainerapps.io/api`
- **API Key**: Configured in `src/lib/api.ts`

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
npx expo start --clear
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Reset Everything
```bash
Remove-Item -Recurse -Force node_modules, .expo
npm install
npm start
```

## 📱 Testing on Physical Device

1. Install **Expo Go** from Play Store or App Store
2. Run `npm start`
3. Scan the QR code with your phone
4. The app will load in Expo Go

## 🏗️ Building for Production

### Android APK
```bash
npx expo build:android
```

### iOS IPA (Mac only)
```bash
npx expo build:ios
```

For custom native builds, use:
```bash
npx expo prebuild
```

## 📄 License

See LICENSE file for details.

## 🎯 Next Steps

1. Add app icons in `assets/` directory
2. Test camera on physical device
3. Customize theme colors in `src/styles/theme.ts`
4. Add offline support
5. Implement receipt export feature

---

**Enjoy your mobile shopping experience! 🛒**
