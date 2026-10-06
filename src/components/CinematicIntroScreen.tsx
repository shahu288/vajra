import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { VajraLogo } from './VajraLogo';
import { colors, spacing, typography } from '../theme';

interface CinematicIntroScreenProps {
  onBegin: () => void;
}

export function CinematicIntroScreen({ onBegin }: CinematicIntroScreenProps) {
  // Animation References
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;
  const kenBurnsAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const logoGlowAnim = useRef(new Animated.Value(0.2)).current;
  const shimmerAnim = useRef(new Animated.Value(-100)).current;
  const exitFadeAnim = useRef(new Animated.Value(1)).current;
  const exitTranslateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance Fade & Slide Up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Ken Burns Effect (Slow 2.5% zoom loop over 14 seconds)
    Animated.loop(
      Animated.sequence([
        Animated.timing(kenBurnsAnim, {
          toValue: 1.035,
          duration: 14000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(kenBurnsAnim, {
          toValue: 1,
          duration: 14000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Gentle Floating Camera Movement (-2.5px to +2.5px over 7s)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -2.5,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 2.5,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Soft Breathing Glow around Vajra Logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlowAnim, {
          toValue: 0.55,
          duration: 3500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoGlowAnim, {
          toValue: 0.18,
          duration: 3500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 5. Tiny Shimmer passing across collectible cards every 4.5 seconds
    const shimmerLoop = () => {
      shimmerAnim.setValue(-100);
      Animated.timing(shimmerAnim, {
        toValue: 280,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setTimeout(shimmerLoop, 3500);
      });
    };
    const timer = setTimeout(shimmerLoop, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handlePressBegin = () => {
    // Smooth exit transition: Fade + slight upward slide
    Animated.parallel([
      Animated.timing(exitFadeAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(exitTranslateAnim, {
        toValue: -16,
        duration: 350,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onBegin();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: exitFadeAnim,
          transform: [{ translateY: exitTranslateAnim }],
        },
      ]}
    >
      <View style={styles.viewport}>
        {/* ─── Animated Ken Burns & Floating Background Artwork ─────── */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [
                { scale: kenBurnsAnim },
                { translateY: floatAnim },
              ],
            },
          ]}
        >
          <Animated.Image
            source={require('../../assets/images/intro.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* ─── Ambient Lighting & Shading Overlays ────────────────── */}
        {/* Top Vignette Overlay */}
        <LinearGradient
          colors={['rgba(5, 5, 10, 0.75)', 'rgba(5, 5, 10, 0.15)', 'transparent']}
          locations={[0, 0.4, 1]}
          style={styles.topVignette}
          pointerEvents="none"
        />

        {/* ─── Upper-Middle Focal Point: Logo in Background Image & Soft Breathing Glow ─── */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: floatAnim }],
            },
          ]}
          pointerEvents="none"
        >
          <Animated.View
            style={[
              styles.logoGlowAura,
              { opacity: logoGlowAnim },
            ]}
          />
        </Animated.View>

        {/* Collectible Cards Shimmer Line Pass */}
        <View style={styles.cardShimmerZone} pointerEvents="none">
          <Animated.View
            style={[
              styles.shimmerBeam,
              {
                transform: [
                  { translateX: shimmerAnim },
                  { rotateZ: '25deg' },
                ],
              },
            ]}
          />
        </View>

        {/* Bottom Depth Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(5, 5, 10, 0.65)', 'rgba(5, 5, 10, 0.95)', '#05050A']}
          locations={[0, 0.35, 0.7, 1]}
          style={styles.bottomVignette}
          pointerEvents="none"
        />

        {/* ─── Minimal UI Layout (Near Bottom) ────────────────────── */}
        <Animated.View
          style={[
            styles.uiOverlay,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Subtle Top Accent Divider Line */}
          <View style={styles.goldDivider} />

          {/* Heading */}
          <Text style={styles.heading}>FORGE YOUR DISCIPLINE</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Small daily promises become lasting strength.
          </Text>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handlePressBegin}
            activeOpacity={0.88}
            {...(Platform.OS === 'web' ? ({ className: 'hover-glow' } as any) : {})}
          >
            <LinearGradient
              colors={['#FFE48A', '#F3BA45', '#B5872A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnGradient}
            >
              <Text style={styles.primaryBtnText}>BEGIN THE JOURNEY →</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Muted Text */}
          <Text style={styles.secondaryText}>Your journey begins here.</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: '#060708',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  viewport: {
    width: '100%',
    maxWidth: 440,
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0B0C0E',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  logoContainer: {
    position: 'absolute',
    top: '17%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoGlowAura: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F3BA45',
    ...Platform.select({
      web: {
        filter: 'blur(45px)',
      } as any,
      default: {},
    }),
  },
  cardShimmerZone: {
    position: 'absolute',
    top: '52%',
    left: '12%',
    width: 280,
    height: 160,
    overflow: 'hidden',
  },
  shimmerBeam: {
    width: 45,
    height: 220,
    backgroundColor: 'rgba(255, 230, 180, 0.22)',
    ...Platform.select({
      web: {
        filter: 'blur(12px)',
      } as any,
      default: {},
    }),
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 380,
  },
  uiOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    alignItems: 'center',
    gap: spacing.sm,
  },
  goldDivider: {
    width: 32,
    height: 2,
    backgroundColor: '#F3BA45',
    borderRadius: 1,
    marginBottom: spacing.xs,
  },
  heading: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 22,
    fontWeight: '700',
    color: '#F5F6F8',
    letterSpacing: 3.5,
    textAlign: 'center',
    textShadowColor: 'rgba(243, 186, 69, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: '#8A91A0',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 310,
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  primaryBtn: {
    width: '100%',
    maxWidth: 320,
    height: 52,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
    marginTop: spacing.xs,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 28px rgba(243, 186, 69, 0.25), 0 0 12px rgba(243, 186, 69, 0.15)',
      } as any,
      default: {
        shadowColor: '#F3BA45',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 5,
      },
    }),
  },
  btnGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0B0C0E',
    letterSpacing: 2,
  },
  secondaryText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 10.5,
    color: '#8A91A0',
    letterSpacing: 1.2,
    marginTop: spacing.xs,
  },
});
