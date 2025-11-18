// Disable Expo's winter runtime in tests - must be first
global.structuredClone = global.structuredClone || ((obj) => JSON.parse(JSON.stringify(obj)));
global.__ExpoImportMetaRegistry = {};

// Mock expo/src/winter before it loads
jest.mock('expo/src/winter/runtime.native', () => ({}), { virtual: true });
jest.mock('expo/src/winter/installGlobal', () => ({}), { virtual: true });

// Mock phosphor-react-native
jest.mock('phosphor-react-native', () => ({
  ArrowLeft: 'ArrowLeft',
  CheckCircle: 'CheckCircle',
  MapPin: 'MapPin',
  ShoppingCart: 'ShoppingCart',
  Plus: 'Plus',
  Minus: 'Minus',
  Trash: 'Trash',
  PencilSimple: 'PencilSimple',
  Camera: 'Camera',
  Image: 'Image',
  X: 'X',
  Star: 'Star',
  CalendarBlank: 'CalendarBlank',
}));

// Mock expo modules
jest.mock('expo', () => ({}));

jest.mock('expo-camera', () => ({
  Camera: 'Camera',
  CameraView: 'CameraView',
  useCameraPermissions: () => [{ granted: true }, jest.fn()],
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: { Base64: 'base64' },
}));

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
  };
});

// Mock toast
jest.mock('./src/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Global fetch mock
global.fetch = jest.fn();
