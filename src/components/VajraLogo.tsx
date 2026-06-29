import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface LogoProps {
  size?: number;
}

export function VajraLogo({ size = 32 }: LogoProps) {
  if (Platform.OS === 'web') {
    // Render the user's high-fidelity custom SVG on web
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 500 500" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          {/* Prismatic Diamond Cyan Glow Layer */}
          <filter id="vajraGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Refractive Core Gradients */}
          <linearGradient id="prismLight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E0F7FA" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
          
          <linearGradient id="prismDark" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="50%" stopColor="#00838F" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
        </defs>

        {/* Ambient Backdrop Core Aura */}
        <polygon points="250,80 410,360 90,360" fill="#00E5FF" opacity="0.04" filter="url(#vajraGlow)" />

        {/* The Three Triangles Strength Matrix with Integrated 'V' */}
        <g strokeLinejoin="round">
          {/* TRIANGLE 1: The Outer Shield (Foundation of Strength) */}
          <polygon points="250,90 400,350 100,350" fill="none" stroke="url(#prismDark)" strokeWidth="4" opacity="0.4" />
          
          {/* TRIANGLE 2: The Core Vault (Interlocking Middle Layer) */}
          <polygon points="250,150 350,320 150,320" fill="none" stroke="url(#prismLight)" strokeWidth="5" strokeDasharray="16 8" />
          
          {/* THE "V" MONOGRAM SHARD: The Inverted Core Triangle */}
          <path d="M 180,190 L 220,190 L 250,260 L 280,190 L 320,190 L 250,320 Z" fill="url(#prismLight)" filter="url(#vajraGlow)" />
        </g>

        {/* Geometric Horizon Alignment Marks */}
        <circle cx="250" cy="210" r="3" fill="#FFFFFF" />
        <line x1="220" y1="380" x2="280" y2="380" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    );
  }

  // Native fallback using overlapping styled shapes representing the shield & V core
  const strokeColor = '#00E5FF';
  const lightColor = '#FFFFFF';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer Triangle Shield (Cyan outline) */}
      <View style={[styles.outerShield, {
        borderLeftWidth: size * 0.4,
        borderRightWidth: size * 0.4,
        borderBottomWidth: size * 0.7,
        borderBottomColor: strokeColor,
        opacity: 0.4,
        left: size * 0.1,
        top: size * 0.1,
      }]}>
        {/* Cutout to make it fill="none" / outline */}
        <View style={[styles.outerShieldCutout, {
          borderLeftWidth: size * 0.36,
          borderRightWidth: size * 0.36,
          borderBottomWidth: size * 0.63,
          left: -size * 0.36,
          top: size * 0.05,
        }]} />
      </View>

      {/* Inner Vault (Dashed white/cyan triangle outline approximation) */}
      <View style={[styles.innerVault, {
        borderLeftWidth: size * 0.28,
        borderRightWidth: size * 0.28,
        borderBottomWidth: size * 0.5,
        borderBottomColor: strokeColor,
        opacity: 0.7,
        left: size * 0.22,
        top: size * 0.22,
      }]}>
        <View style={[styles.outerShieldCutout, {
          borderLeftWidth: size * 0.24,
          borderRightWidth: size * 0.24,
          borderBottomWidth: size * 0.43,
          left: -size * 0.24,
          top: size * 0.04,
        }]} />
      </View>

      {/* V Shard (Central monogram) */}
      <View style={[styles.vContainer, {
        width: size * 0.4,
        height: size * 0.3,
        left: size * 0.3,
        top: size * 0.35,
      }]}>
        {/* Left wing of V */}
        <View style={[styles.vLine, {
          width: size * 0.08,
          height: size * 0.25,
          backgroundColor: lightColor,
          transform: [{ rotate: '-30deg' }],
          left: size * 0.05,
        }]} />
        {/* Right wing of V */}
        <View style={[styles.vLine, {
          width: size * 0.08,
          height: size * 0.25,
          backgroundColor: lightColor,
          transform: [{ rotate: '30deg' }],
          right: size * 0.05,
        }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  outerShield: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  outerShieldCutout: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#08080C', // matches dark background
  },
  innerVault: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  vContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vLine: {
    position: 'absolute',
    borderRadius: 2,
  },
});

export default VajraLogo;

