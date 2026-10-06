import React from 'react';
import { Image, ImageStyle } from 'react-native';

interface LogoProps {
  size?: number;
  style?: ImageStyle;
  color?: string; // Kept for API compatibility, not used for image logo
}

export function VajraLogo({ size = 32, style }: LogoProps) {
  return (
    <Image 
      source={require('../../assets/images/logo.png')}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}

export default VajraLogo;
