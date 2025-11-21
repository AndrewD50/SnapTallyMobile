import type { Frame } from 'react-native-vision-camera';

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  points: { x: number; y: number }[];
}

/**
 * Detects rectangles in a camera frame
 * Uses a simplified algorithm to detect rectangular shapes
 */
export function detectRectangles(frame: Frame): Rectangle[] {
  'worklet';
  
  try {
    // For now, return empty array
    // Real implementation will be added with frame processor plugin
    // This is a placeholder for the structure
    return [];
  } catch (error) {
    console.error('Rectangle detection error:', error);
    return [];
  }
}

/**
 * Finds the brightest rectangle from detected rectangles
 * Prioritizes by confidence score (document boundary detection)
 */
export function findBrightestRectangle(rectangles: Rectangle[]): Rectangle | null {
  if (rectangles.length === 0) return null;

  // Sort by confidence (highest first)
  const sorted = [...rectangles].sort((a, b) => b.confidence - a.confidence);
  
  // Return the highest confidence rectangle (most likely to be a document/price tag)
  return sorted[0];
}

/**
 * Converts rectangle coordinates to relative percentages (0-1)
 * for consistent rendering across different screen sizes
 */
export function normalizeRectangle(
  rect: Rectangle,
  frameWidth: number,
  frameHeight: number
): Rectangle {
  return {
    ...rect,
    x: rect.x / frameWidth,
    y: rect.y / frameHeight,
    width: rect.width / frameWidth,
    height: rect.height / frameHeight,
    points: rect.points.map(p => ({
      x: p.x / frameWidth,
      y: p.y / frameHeight,
    })),
  };
}
