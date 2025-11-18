# OCR Test Images

Place your test images in this folder for OCR testing.

## Suggested Test Images

1. **receipt-image.jpg** - A receipt with prices and item names
2. **price-tag.jpg** - A single price tag or label
3. **product-label.jpg** - A product with name and price visible
4. **shopping-list.jpg** - A handwritten or printed shopping list
5. **multi-price-image.jpg** - An image containing multiple prices

## Image Requirements

- Supported formats: JPG, PNG
- Clear, well-lit images work best
- Text should be readable and not too blurry
- Avoid extreme angles or distortion

## Usage

After adding your images here, update the paths in `src/__tests__/ocr.test.ts` to point to these files.

Example:
```typescript
const imagePath = 'src/__tests__/fixtures/ocr-images/receipt-image.jpg';
```
