import { ShopItem } from '../types';

/**
 * OCR Text Transformer
 * 
 * This class transforms raw OCR extracted text into structured ShopItem models.
 * It uses pattern matching and heuristics to identify product names, brands, prices, and weights.
 */
export class OCRTextTransformer {
  /**
   * Transform OCR text into a ShopItem model
   * @param ocrText The raw text extracted from OCR
   * @returns A ShopItem object with extracted properties
   */
  static transformToShopItem(ocrText: string): Partial<ShopItem> {
    const cleanedText = this.cleanText(ocrText);
    
    return {
      name: this.extractName(cleanedText),
      brand: this.extractBrand(cleanedText),
      price: this.extractPrice(cleanedText),
      weight: this.extractWeight(cleanedText),
    };
  }

  /**
   * Clean and normalize OCR text
   * Removes extra whitespace, normalizes line breaks, etc.
   */
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, ' ') // Replace newlines with space
      .trim();
  }

  /**
   * Extract product name from OCR text
   * Looks for the first non-brand, non-price line that appears to be a product name
   */
  private static extractName(text: string): string {
    // Remove common noise words
    const cleaned = text.replace(/\b(barcode|sku|item|product|code)\s*:?\s*\d+/gi, '');
    
    // Split into potential segments
    const segments = cleaned.split(/[,;|]/);
    
    // Look for the longest meaningful segment that's not a price or brand
    for (const segment of segments) {
      const trimmed = segment.trim();
      // Skip if it's too short, looks like a price, or is just numbers
      if (trimmed.length < 3 || /^\$?\d+\.?\d*$/.test(trimmed) || /^\d+$/.test(trimmed)) {
        continue;
      }
      // Skip if it looks like a weight
      if (/\d+\s*(oz|lb|lbs|g|kg|ml|l)\b/i.test(trimmed)) {
        continue;
      }
      return trimmed;
    }
    
    // Fallback: return first few words
    const words = text.split(' ').filter(w => w.length > 2);
    return words.slice(0, 3).join(' ') || 'Unknown Product';
  }

  /**
   * Extract brand name from OCR text
   * Looks for common brand indicators and patterns
   */
  private static extractBrand(text: string): string {
    // Common brand patterns
    const brandPatterns = [
      /brand\s*:?\s*([a-z\s&'-]+)/i,
      /by\s+([a-z\s&'-]+)/i,
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/, // Capitalized words (potential brand)
    ];

    // Known brand keywords that might appear in text
    const brandKeywords = ['organic', 'fresh', 'natural', 'premium', 'select', 'choice'];

    for (const pattern of brandPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const brand = match[1].trim();
        // Validate it's not a common word
        if (brand.length > 2 && !this.isCommonWord(brand.toLowerCase())) {
          return brand;
        }
      }
    }

    // Check for brand keywords
    for (const keyword of brandKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        return keyword.charAt(0).toUpperCase() + keyword.slice(1);
      }
    }

    return 'Generic';
  }

  /**
   * Extract price from OCR text
   * Supports various price formats: $12.99, 12.99, $12, etc.
   */
  private static extractPrice(text: string): number {
    // Price patterns in order of priority
    const pricePatterns = [
      /(?:price|total|cost)\s*:?\s*\$?(\d+\.?\d{0,2})/gi, // Labeled price
      /\$\s*(\d+\.\d{2})/g, // $12.99 format
      /\$\s*(\d+)/g, // $12 format
      /(\d+\.\d{2})\s*(?:dollars?|usd|each|ea)/gi, // 12.99 dollars
      /\b(\d+\.\d{2})\b/g, // Any decimal number (last resort)
    ];

    for (const pattern of pricePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        // Get the last match (often the total or final price)
        const lastMatch = matches[matches.length - 1];
        const price = parseFloat(lastMatch[1]);
        if (!isNaN(price) && price > 0 && price < 10000) {
          return price;
        }
      }
    }

    return 0;
  }

  /**
   * Extract weight from OCR text
   * Supports formats like: 16 oz, 1.5 lb, 500g, 2 kg, 250ml, etc.
   */
  private static extractWeight(text: string): number {
    const weightPatterns = [
      /(\d+\.?\d*)\s*(oz|ounces?)/i,
      /(\d+\.?\d*)\s*(lb|lbs|pounds?)/i,
      /(\d+\.?\d*)\s*(g|grams?)/i,
      /(\d+\.?\d*)\s*(kg|kilograms?)/i,
      /(\d+\.?\d*)\s*(ml|milliliters?)/i,
      /(\d+\.?\d*)\s*(l|liters?)/i,
    ];

    for (const pattern of weightPatterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();

        // Normalize to a common unit (e.g., ounces for weight, ml for volume)
        if (!isNaN(value) && value > 0) {
          // Convert to standard units
          if (unit.startsWith('lb') || unit.startsWith('pound')) {
            return value * 16; // Convert pounds to ounces
          } else if (unit.startsWith('kg') || unit.startsWith('kilogram')) {
            return value * 1000; // Convert kg to grams
          } else if (unit.startsWith('l') && !unit.startsWith('lb')) {
            return value * 1000; // Convert liters to ml
          }
          return value;
        }
      }
    }

    return 0;
  }

  /**
   * Check if a word is a common English word (to filter out false brand matches)
   */
  private static isCommonWord(word: string): boolean {
    const commonWords = [
      'the', 'and', 'for', 'with', 'from', 'this', 'that', 'these', 'those',
      'item', 'product', 'price', 'total', 'cost', 'name', 'brand', 'weight',
      'size', 'quantity', 'pack', 'package', 'each', 'per', 'sale', 'new'
    ];
    return commonWords.includes(word.toLowerCase());
  }

  /**
   * Transform OCR text into multiple ShopItem candidates
   * Useful when OCR text contains multiple products
   */
  static transformToMultipleItems(ocrText: string): Array<Partial<ShopItem>> {
    // Split by common delimiters that might separate multiple items
    const itemTexts = ocrText.split(/\n{2,}|\|\||--|___/);
    
    return itemTexts
      .filter(text => text.trim().length > 0)
      .map(text => this.transformToShopItem(text));
  }

  /**
   * Validate and score the confidence of extracted data
   * Returns a confidence score from 0 to 1
   */
  static getConfidenceScore(shopItem: Partial<ShopItem>): number {
    let score = 0;
    let maxScore = 4;

    // Name confidence
    if (shopItem.name && shopItem.name !== 'Unknown Product' && shopItem.name.length > 5) {
      score += 1;
    } else if (shopItem.name && shopItem.name !== 'Unknown Product') {
      score += 0.5;
    }

    // Brand confidence
    if (shopItem.brand && shopItem.brand !== 'Generic' && shopItem.brand.length > 2) {
      score += 1;
    } else if (shopItem.brand && shopItem.brand !== 'Generic') {
      score += 0.5;
    }

    // Price confidence
    if (shopItem.price && shopItem.price > 0 && shopItem.price < 1000) {
      score += 1;
    } else if (shopItem.price && shopItem.price > 0) {
      score += 0.5;
    }

    // Weight confidence
    if (shopItem.weight && shopItem.weight > 0 && shopItem.weight < 10000) {
      score += 1;
    } else if (shopItem.weight && shopItem.weight > 0) {
      score += 0.5;
    }

    return score / maxScore;
  }
}
