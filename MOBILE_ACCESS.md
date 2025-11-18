# Accessing SnapTallyMobile on Your Phone

Your SnapTallyMobile app is a web application that runs in your browser. Here's how to access it on your phone:

## Option 1: Direct URL Access (Recommended)

1. **Get your app's URL** from the browser where you're currently viewing it
   - It should look something like: `https://[your-codespace-name].github.dev` or a similar GitHub Codespaces URL

2. **Open your phone's browser** (Safari on iPhone, Chrome on Android)

3. **Enter the URL** from step 1 into your phone's browser

4. **Grant camera permissions** when prompted - this is essential for scanning price tags

## Option 2: Share via QR Code

1. Use a QR code generator to create a QR code from your app's URL
2. Scan the QR code with your phone's camera
3. Tap to open the link in your browser

## Making it Feel Like a Native App

### iPhone (Add to Home Screen)
1. Open the app in Safari
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Name it "SnapTallyMobile" and tap "Add"
5. Now you'll have an app icon on your home screen!

### Android (Add to Home Screen)
1. Open the app in Chrome
2. Tap the menu button (three dots)
3. Tap "Add to Home Screen" or "Install App"
4. Name it "SnapTallyMobile" and tap "Add"
5. The app icon will appear on your home screen!

## Important Notes

- **Camera Access**: Make sure to allow camera permissions when prompted - the app needs this to scan price tags
- **Internet Connection**: The app requires an internet connection to analyze price tags via the Azure API
- **Same Account**: Your shopping sessions are stored in your browser's storage, so you'll need to use the same browser/device to see your session history
- **Lighting**: For best results when scanning price tags, ensure good lighting and hold your phone steady

## Troubleshooting

**Can't access the URL?**
- Make sure your Codespace is running
- Check that the URL is correct and includes the protocol (https://)
- Try accessing in an incognito/private browsing window first

**Camera not working?**
- Check browser permissions in your phone's Settings
- Try using a different browser (Chrome, Safari, Firefox)
- Make sure no other app is using the camera

**App feels slow?**
- This is normal - the app is running from a remote server
- The scanning/analysis might take a few seconds depending on your connection
- Consider the lighting and image quality for faster processing

## Best Practices

1. **Use in well-lit areas** - grocery stores usually have good lighting
2. **Hold phone steady** when capturing price tags
3. **Get close enough** to make text clearly readable
4. **Check the preview** before confirming the scan
5. **Start a new session** for each shopping trip to keep things organized
