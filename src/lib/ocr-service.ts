import TextRecognition from 'react-native-text-recognition';
import { OCRTextTransformer } from './ocr-text-transformer';
import { analyzePriceTag } from './api';
import { OCRSettings } from './ocr-settings';
import { ShopItem } from '../types';

export interface OCRResult {
  name: string;
  brand: string;
  price: number;
  weight: number;
  ocrText?: string;
  source: 'local' | 'api';
  confidence?: number;
}

/**
 * Unified OCR Service
 * Handles both local OCR and API-based OCR based on settings
 */
export class OCRService {
  /**
   * Analyze an image using either local OCR or API
   * @param imageUri - The URI of the image to analyze
   * @param base64 - Optional base64 string of the image
   * @returns OCR result with item details
   */
  static async analyzeImage(imageUri: string, base64?: string): Promise<OCRResult> {
    const useLocalOCR = await OCRSettings.getUseLocalOCR();

    if (useLocalOCR) {
      return await this.analyzeWithLocalOCR(imageUri);
    } else {
      return await this.analyzeWithAPI(imageUri, base64);
    }
  }

  /**
   * Analyze image using local OCR library
   */
  private static async analyzeWithLocalOCR(imageUri: string): Promise<OCRResult> {
    try {
      // Check if TextRecognition is available
      if (!TextRecognition || !TextRecognition.recognize) {
        throw new Error('TextRecognition module is not available. Make sure react-native-text-recognition is properly installed.');
      }

      // Step 1: Extract text using OCR
      const result = await TextRecognition.recognize(imageUri);
      const ocrText = Array.isArray(result) 
        ? result.join(' ').trim() 
        : String(result).trim();

      // Step 2: Transform text to ShopItem
      const shopItem = OCRTextTransformer.transformToShopItem(ocrText);
      const confidence = OCRTextTransformer.getConfidenceScore(shopItem);

      return {
        name: shopItem.name || 'Unknown Item',
        brand: shopItem.brand || '',
        price: shopItem.price || 0,
        weight: shopItem.weight || 0,
        ocrText,
        source: 'local',
        confidence,
      };
    } catch (error) {
      console.error('Local OCR error:', error);
      throw new Error('Failed to analyze image with local OCR');
    }
  }

  /**
   * Analyze image using API endpoint
   */
  private static async analyzeWithAPI(imageUri: string, base64?: string): Promise<OCRResult> {
    try {
      const result = await analyzePriceTag(imageUri, base64);
      
      return {
        name: result.name,
        brand: result.brand,
        price: result.price,
        weight: result.weight,
        ocrText: result.ocrText,
        source: 'api',
      };
    } catch (error) {
      console.error('API OCR error:', error);
      throw new Error('Failed to analyze image with API');
    }
  }

  /**
   * Check if local OCR is currently enabled
   */
  static async isLocalOCREnabled(): Promise<boolean> {
    return await OCRSettings.getUseLocalOCR();
  }

  /**
   * Toggle between local and API OCR
   */
  static async toggleOCRMode(): Promise<boolean> {
    return await OCRSettings.toggleUseLocalOCR();
  }
}
