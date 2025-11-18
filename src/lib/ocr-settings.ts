import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_OCR_KEY = 'useLocalOCR';

/**
 * OCR Settings Manager
 * Manages the toggle between local OCR and API-based OCR
 */
export class OCRSettings {
  /**
   * Get whether local OCR is enabled
   */
  static async getUseLocalOCR(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(LOCAL_OCR_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error reading local OCR setting:', error);
      return false; // Default to API
    }
  }

  /**
   * Set whether to use local OCR
   */
  static async setUseLocalOCR(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(LOCAL_OCR_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      console.error('Error saving local OCR setting:', error);
    }
  }

  /**
   * Toggle the local OCR setting
   */
  static async toggleUseLocalOCR(): Promise<boolean> {
    const current = await this.getUseLocalOCR();
    const newValue = !current;
    await this.setUseLocalOCR(newValue);
    return newValue;
  }
}
