# Development Build Instructions

## What is a Development Build?

A development build is a custom version of your Expo app that includes native modules (like `react-native-text-recognition` and `react-native-vision-camera`) that are not available in Expo Go.

## Current Build Status

We are building a development APK that includes:
- ✅ react-native-text-recognition (local OCR)
- ✅ react-native-vision-camera (camera access)
- ✅ All other native modules

## Installation Steps

### Once the build completes:

1. **Download the APK**
   - You'll receive a link to download the APK file
   - You can also find it at: https://expo.dev/accounts/anddsdsdsnn5810/projects/snaptallymobile/builds

2. **Install on Android Device**
   - Transfer the APK to your Android device
   - Enable "Install from Unknown Sources" in your device settings
   - Tap the APK file to install

3. **Run the App**
   - Open the installed app (it will have a "dev" label)
   - The app will connect to your development server

## Running with Development Build

### Start the development server:
```bash
npm start
```

Then scan the QR code with your development build app (NOT Expo Go).

## Testing Local OCR

Once installed:
1. Open a shopping session
2. Long-press the "Finish" button for 20 seconds to enable debug mode
3. Turn ON the "Local OCR" toggle
4. Tap "Process Thousands" button to test batch OCR processing
5. Select images from your photo library
6. The local OCR will extract text from each image and send it to the API

## Rebuilding

If you need to rebuild after making changes to native code:
```bash
eas build --profile development --platform android
```

## Troubleshooting

### "TextRecognition is null" Error
- This means you're running in Expo Go instead of the development build
- Make sure you're using the custom development build app

### Build Failed
- Check the build logs at: https://expo.dev/accounts/anddsdsdsnn5810/projects/snaptallymobile/builds
- Common issues:
  - Android SDK version mismatch
  - Gradle configuration errors
  - Memory issues during build

### App Won't Connect to Dev Server
- Make sure both your computer and phone are on the same network
- Check firewall settings
- Try running: `npm start --tunnel`

## Build Configuration

The build is configured in `eas.json`:
- Profile: `development`
- Build Type: APK (for easy installation)
- Development Client: Enabled
- Distribution: Internal

## More Information

- EAS Build Documentation: https://docs.expo.dev/build/introduction/
- Development Builds: https://docs.expo.dev/develop/development-builds/introduction/
- Your Project Dashboard: https://expo.dev/accounts/anddsdsdsnn5810/projects/snaptallymobile
