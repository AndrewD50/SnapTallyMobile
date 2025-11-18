import { compressImage } from '../lib/image-compression-native';
import * as ImageManipulator from 'expo-image-manipulator';

jest.mock('expo-image-manipulator');

describe('Image Compression', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for expected errors
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should compress image successfully', async () => {
    const mockCompressedUri = 'file://compressed-image.jpg';
    const mockBase64 = 'base64encodedstring';

    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      uri: mockCompressedUri,
      base64: mockBase64,
    });

    const result = await compressImage('file://original-image.jpg');

    expect(result).toEqual({
      uri: mockCompressedUri,
      base64: mockBase64,
    });

    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      'file://original-image.jpg',
      [{ resize: { width: 1024, height: 1024 } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
  });

  it('should handle compression errors', async () => {
    const error = new Error('Compression failed');
    (ImageManipulator.manipulateAsync as jest.Mock).mockRejectedValue(error);

    await expect(compressImage('file://image.jpg')).rejects.toThrow();
  });

  it('should handle base64 encoding errors', async () => {
    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      uri: 'file://compressed.jpg',
      base64: undefined,
    });

    const result = await compressImage('file://image.jpg');
    
    // Should still work even without base64
    expect(result.uri).toBe('file://compressed.jpg');
  });
});
