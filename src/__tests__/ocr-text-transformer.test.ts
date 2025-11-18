import { OCRTextTransformer } from '../lib/ocr-text-transformer';
import { ShopItem } from '../types';
import TextRecognition from 'react-native-text-recognition';

/**
 * Helper function to extract text from an image using OCR
 */
const extractTextFromImage = async (imagePath: string): Promise<string> => {
  try {
    const result = await TextRecognition.recognize(imagePath);
    // The result is an array of strings, join them together
    if (Array.isArray(result)) {
      return result.join(' ').trim();
    }
    return String(result).trim();
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
};

describe('OCRTextTransformer', () => {

  describe('Integration with OCR Library', () => {
    /**
     * PLACEHOLDER TESTS - Update these with your actual image paths
     * 
     * Instructions:
     * 1. Add test images to src/__tests__/fixtures/ocr-images/
     * 2. Update the imagePath in each test
     * 3. Update the expected values based on what's in your images
     */

    it.skip('should extract and transform data from receipt image', async () => {
      // TODO: Update this path to your actual receipt image
      // NOTE: This test requires running on a real device or emulator with OCR support
      const imagePath = 'src/__tests__/fixtures/ocr-images/1.png';
      
      // Step 1: Extract text using OCR
      const ocrText = await extractTextFromImage(imagePath);
      console.log('Extracted OCR Text:', ocrText);
      
      // Step 2: Transform OCR text to ShopItem
      const result = OCRTextTransformer.transformToShopItem(ocrText);
      
      // TODO: Update these expectations based on your image content
      expect(result.name).toBeTruthy();
      expect(result.price).toBeGreaterThan(0);
      expect(result.brand).toBeTruthy();
      
      // Check confidence score
      const confidence = OCRTextTransformer.getConfidenceScore(result);
      console.log('Confidence Score:', confidence);
      expect(confidence).toBeGreaterThan(0);
    }, 15000);

    it.skip('should extract and transform data from price tag image', async () => {
      // TODO: Update this path to your actual price tag image
      const imagePath = 'src/__tests__/fixtures/ocr-images/price-tag.jpg';
      
      // Step 1: Extract text using OCR
      const ocrText = await extractTextFromImage(imagePath);
      console.log('Extracted OCR Text:', ocrText);
      
      // Step 2: Transform OCR text to ShopItem
      const result = OCRTextTransformer.transformToShopItem(ocrText);
      
      // TODO: Update these expectations based on your image content
      expect(result.price).toBe(15.49); // Update with actual price
      expect(result.weight).toBeGreaterThan(0);
      
      const confidence = OCRTextTransformer.getConfidenceScore(result);
      console.log('Confidence Score:', confidence);
    }, 15000);

    it.skip('should extract and transform data from product label', async () => {
      // TODO: Update this path to your actual product label image
      const imagePath = 'src/__tests__/fixtures/ocr-images/product-label.jpg';
      
      // Step 1: Extract text using OCR
      const ocrText = await extractTextFromImage(imagePath);
      console.log('Extracted OCR Text:', ocrText);
      
      // Step 2: Transform OCR text to ShopItem
      const result = OCRTextTransformer.transformToShopItem(ocrText);
      
      // TODO: Update these expectations based on your image content
      expect(result.name).toContain('Product Name'); // Update with actual name
      expect(result.brand).toBeTruthy();
      expect(result.price).toBe(9.99); // Update with actual price
      expect(result.weight).toBeGreaterThan(0);
      
      const confidence = OCRTextTransformer.getConfidenceScore(result);
      console.log('Confidence Score:', confidence);
      expect(confidence).toBeGreaterThan(0.5);
    }, 15000);

    it.skip('should handle multiple items from shopping list image', async () => {
      // TODO: Update this path to your actual shopping list image
      const imagePath = 'src/__tests__/fixtures/ocr-images/shopping-list.jpg';
      
      // Step 1: Extract text using OCR
      const ocrText = await extractTextFromImage(imagePath);
      console.log('Extracted OCR Text:', ocrText);
      
      // Step 2: Transform to multiple items if possible
      const results = OCRTextTransformer.transformToMultipleItems(ocrText);
      
      // TODO: Update based on number of items in your image
      expect(results.length).toBeGreaterThan(0);
      
      results.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, item);
        const confidence = OCRTextTransformer.getConfidenceScore(item);
        console.log(`Confidence ${index + 1}:`, confidence);
      });
    }, 15000);

    it.skip('should extract multiple prices from single image', async () => {
      // TODO: Update this path to your image with multiple prices
      const imagePath = 'src/__tests__/fixtures/ocr-images/multi-price.jpg';
      
      // Step 1: Extract text using OCR
      const ocrText = await extractTextFromImage(imagePath);
      console.log('Extracted OCR Text:', ocrText);
      
      // Step 2: Transform to ShopItem
      const result = OCRTextTransformer.transformToShopItem(ocrText);
      
      // TODO: Update with expected price (should be the last/final price)
      expect(result.price).toBeGreaterThan(0);
      
      console.log('Extracted Item:', result);
      const confidence = OCRTextTransformer.getConfidenceScore(result);
      console.log('Confidence Score:', confidence);
    }, 15000);

    it('should demonstrate the full OCR-to-ShopItem workflow', async () => {
      // This test demonstrates the workflow without requiring an actual image
      // It simulates what happens when OCR extracts text from an image
      
      // Simulate OCR extraction result
      const mockOcrText = 'Organic Bananas by Fresh Farms 2 lb $3.99';
      
      // Transform to ShopItem
      const result = OCRTextTransformer.transformToShopItem(mockOcrText);
      
      expect(result.name).toBeTruthy();
      expect(result.brand).toBeTruthy();
      expect(result.price).toBe(3.99);
      expect(result.weight).toBe(32); // 2 lb * 16 oz/lb
      
      // Check confidence
      const confidence = OCRTextTransformer.getConfidenceScore(result);
      expect(confidence).toBeGreaterThan(0.5);
      
      console.log('Mock OCR Result:', result);
      console.log('Confidence:', confidence);
    });
  });
});
