import * as ImageManipulator from 'expo-image-manipulator';

export async function compressImage(
  uri: string,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.85
): Promise<{ uri: string; base64?: string }> {
  try {
    // Manipulate the image directly without checking if it exists
    // expo-image-manipulator will handle invalid URIs
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    return result;
  } catch (error) {
    console.error('Failed to compress image:', error);
    throw error;
  }
}

export async function imageUriToBlob(uri: string): Promise<Blob> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Failed to convert image URI to Blob:', error);
    throw error;
  }
}

export async function base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Promise<Blob> {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
