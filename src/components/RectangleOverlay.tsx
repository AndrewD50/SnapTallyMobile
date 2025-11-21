import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Polygon, Line } from 'react-native-svg';
import type { Rectangle } from '../lib/rectangle-detector';

interface RectangleOverlayProps {
  rectangle: Rectangle | null;
  frameWidth: number;
  frameHeight: number;
  color?: string;
  lineWidth?: number;
}

/**
 * Visual overlay that draws a rectangle on the camera preview
 * Shows users what will be captured for OCR processing
 */
export function RectangleOverlay({
  rectangle,
  frameWidth,
  frameHeight,
  color = '#00FF00',
  lineWidth = 3,
}: RectangleOverlayProps) {
  if (!rectangle || frameWidth === 0 || frameHeight === 0) {
    return null;
  }

  // Convert normalized coordinates (0-1) back to screen coordinates
  const points = rectangle.points.map(p => ({
    x: p.x * frameWidth,
    y: p.y * frameHeight,
  }));

  // Create polygon points string for SVG
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={frameWidth} height={frameHeight}>
        {/* Draw the quad/rectangle outline */}
        <Polygon
          points={polygonPoints}
          fill="transparent"
          stroke={color}
          strokeWidth={lineWidth}
        />
        
        {/* Draw corner indicators */}
        {points.map((point, index) => (
          <Line
            key={`corner-${index}`}
            x1={point.x - 10}
            y1={point.y}
            x2={point.x + 10}
            y2={point.y}
            stroke={color}
            strokeWidth={lineWidth + 1}
          />
        ))}
      </Svg>
    </View>
  );
}
