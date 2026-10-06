import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AtmosphericBackgroundProps {
  hideRipples?: boolean;
}

export function AtmosphericBackground({ hideRipples = false }: AtmosphericBackgroundProps) {
  const { colors, isDark } = useTheme();

  // Glow Auras Breathing animations
  const glow1Anim = useRef(new Animated.Value(0)).current;
  const glow2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Breathing aura 1
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow1Anim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: false,
        }),
        Animated.timing(glow1Anim, {
          toValue: 0,
          duration: 10000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Breathing aura 2
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow2Anim, {
          toValue: 1,
          duration: 14000,
          useNativeDriver: false,
        }),
        Animated.timing(glow2Anim, {
          toValue: 0,
          duration: 14000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const scale1 = glow1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const opacity1 = glow1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: isDark ? [0.03, 0.07] : [0.04, 0.08],
  });

  const scale2 = glow2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const opacity2 = glow2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: isDark ? [0.04, 0.09] : [0.05, 0.1],
  });

  const glow1Style = {
    transform: [{ scale: scale1 }],
    opacity: opacity1,
    backgroundColor: colors.primary,
  };

  const glow2Style = {
    transform: [{ scale: scale2 }],
    opacity: opacity2,
    backgroundColor: colors.secondary,
  };

  if (Platform.OS === 'web') {
    const webStyles = {
      gradBase: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 15%, #14171C 0%, #0F1115 50%, #0B0C0E 100%)',
      },
      washiTexture: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: isDark ? 0.25 : 0.15,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='washiNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23washiNoise)' opacity='0.04'/%3E%3C/svg%3E")`,
      },
      vignette: {
        position: 'absolute' as const,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: 'radial-gradient(circle, transparent 35%, rgba(11, 12, 14, 0.95) 100%)',
      },
    };

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[styles.webContainer, { backgroundColor: colors.bg.primary }]}>
          {/* Layer 1: Curated Earthy Warm Gradient Base */}
          <div style={webStyles.gradBase} />

          {/* Layer 2: Organic Zen Sand concentric ripples SVG */}
          {!hideRipples && (
            <svg style={styles.zenRipples as any} viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
              <circle cx="500" cy="500" r="120" stroke={colors.primary} strokeWidth="1" fill="none" strokeDasharray="3 3" />
              <circle cx="500" cy="500" r="200" stroke={colors.primary} strokeWidth="1" fill="none" />
              <circle cx="500" cy="500" r="280" stroke={colors.primary} strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
              <circle cx="500" cy="500" r="360" stroke={colors.primary} strokeWidth="1.5" fill="none" />
              <circle cx="500" cy="500" r="440" stroke={colors.primary} strokeWidth="2" fill="none" strokeDasharray="6 6" />
              <circle cx="500" cy="500" r="520" stroke={colors.primary} strokeWidth="2" fill="none" />
            </svg>
          )}

          {/* Layer 3: Breathing warm amber/stone ambient light spots */}
          <Animated.View style={[styles.glowAura, styles.glowAura1, glow1Style]} />
          <Animated.View style={[styles.glowAura, styles.glowAura2, glow2Style]} />

          {/* Layer 4: Organic Washi Paper texture filter overlay */}
          <div style={webStyles.washiTexture} />

          {/* Layer 5: Dark/Parchment Vignette */}
          <div style={webStyles.vignette} />

          {/* Floating warm embers */}
          <View className="ambient-ember-container" style={styles.emberContainer}>
            <View style={[styles.ember, { left: '12%', animationDelay: '0s', width: 2, height: 2 }]} />
            <View style={[styles.ember, { left: '30%', animationDelay: '5s', width: 2.5, height: 2.5 }]} />
            <View style={[styles.ember, { left: '55%', animationDelay: '2s', width: 1.5, height: 1.5 }]} />
            <View style={[styles.ember, { left: '72%', animationDelay: '8s', width: 3, height: 3 }]} />
            <View style={[styles.ember, { left: '88%', animationDelay: '4s', width: 2, height: 2 }]} />
          </View>
        </View>
        <style>{`
          @keyframes ambient-float {
            0% { transform: translateY(110vh) scale(0); opacity: 0; }
            15% { opacity: 0.35; }
            85% { opacity: 0.2; }
            100% { transform: translateY(-10vh) scale(1); opacity: 0; }
          }
          .ambient-ember-container div {
            position: absolute;
            bottom: 0;
            background-color: ${colors.primary};
            border-radius: 50%;
            filter: blur(0.5px);
            opacity: 0;
            animation: ambient-float 26s linear infinite;
          }
        `}</style>
      </View>
    );
  }

  // Mobile layout fallback
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[colors.bg.primary, colors.bg.surface, colors.bg.primary]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.glowAura, styles.glowAura1, glow1Style]} />
      <Animated.View style={[styles.glowAura, styles.glowAura2, glow2Style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  zenRipples: {
    position: 'absolute',
    bottom: '-15%',
    left: '-20%',
    width: '140%',
    height: '80%',
    opacity: 0.06,
    pointerEvents: 'none',
  },
  glowAura: {
    position: 'absolute',
    borderRadius: 9999,
  },
  glowAura1: {
    top: '10%',
    left: '-20%',
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_WIDTH * 0.95,
    ...Platform.select({
      web: {
        filter: 'blur(150px)',
      },
    }),
  },
  glowAura2: {
    bottom: '8%',
    right: '-15%',
    width: SCREEN_WIDTH * 1.15,
    height: SCREEN_WIDTH * 1.15,
    ...Platform.select({
      web: {
        filter: 'blur(180px)',
      },
    }),
  },
  emberContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  ember: {},
});

export default AtmosphericBackground;
