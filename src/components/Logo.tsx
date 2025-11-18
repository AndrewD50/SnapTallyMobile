import React from 'react';
import Svg, { G, Path, Rect, Circle, Text } from 'react-native-svg';

interface LogoProps {
  width?: number;
  height?: number;
}

export function Logo({ width = 360, height = 76 }: LogoProps) {
  return (
    <Svg 
      viewBox="0 0 360 76" 
      width={width} 
      height={height}
    >
      <G transform="translate(0,0)">
        <Path d="M6 12 H70 L62 46 H22 Z" fill="#00c896" stroke="none" />
        <Rect x="2" y="8" width="10" height="6" rx="3" fill="#00c896" />
        <Rect x="14" y="46" width="44" height="6" rx="3" fill="#00c896" />
        <Circle cx="24" cy="60" r="6" fill="#00c896"/>
        <Circle cx="56" cy="60" r="6" fill="#00c896"/>
        <Path 
          d="M28 30 L36 38 L54 20" 
          fill="none" 
          stroke="#FFFFFF"
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </G>

      <Text 
        x="92" 
        y="56"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="48" 
        fontWeight="700"
        fill="#111111" 
        letterSpacing="-1"
      >
        SnapTallyMobile
      </Text>
    </Svg>
  );
}
