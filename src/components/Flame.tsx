import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, Path, LinearGradient, vec } from '@shopify/react-native-skia';
import { theme } from '../theme';
import { useAppStore } from '../store/useAppStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence, 
  withDelay, 
  Easing 
} from 'react-native-reanimated';

interface FlameProps {
  score: number;
}

// Spark component for transient vow-completion particles on mobile
function Spark({ index }: { index: number }) {
  const x = useSharedValue(80);
  const y = useSharedValue(130);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const targets = [
    { dx: -35, dy: -85 },
    { dx: 30, dy: -95 },
    { dx: -10, dy: -105 },
    { dx: 40, dy: -65 },
    { dx: -40, dy: -55 },
    { dx: 15, dy: -80 },
    { dx: -20, dy: -100 },
    { dx: 5, dy: -70 },
  ];

  const target = targets[index % targets.length];

  useEffect(() => {
    x.value = withTiming(80 + target.dx, { duration: 1200, easing: Easing.out(Easing.quad) });
    y.value = withTiming(130 + target.dy, { duration: 1200, easing: Easing.out(Easing.quad) });
    opacity.value = withTiming(0, { duration: 1200, easing: Easing.in(Easing.quad) });
    scale.value = withTiming(0, { duration: 1200 });
  }, [target.dx, target.dy, opacity, scale, x, y]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: x.value,
      top: y.value,
      width: 3.5,
      height: 3.5,
      borderRadius: 1.75,
      backgroundColor: '#FFF59D',
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return <Animated.View style={animatedStyle} />;
}

// Ember component for ambient rising particles on mobile
function Ember({ delay, startX, driftX }: { delay: number; startX: number; driftX: number }) {
  const y = useSharedValue(145);
  const x = useSharedValue(startX);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    let active = true;
    const runEmber = () => {
      if (!active) return;
      y.value = 145;
      x.value = startX;
      opacity.value = 0;
      scale.value = 0;

      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(0.7, { duration: 500 }),
          withTiming(0.5, { duration: 1500 }),
          withTiming(0, { duration: 1000 })
        )
      );

      scale.value = withDelay(
        delay,
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(0, { duration: 2000 })
        )
      );

      y.value = withDelay(
        delay,
        withTiming(20, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      );

      x.value = withDelay(
        delay,
        withTiming(startX + driftX, { duration: 3000, easing: Easing.inOut(Easing.ease) }, (finished) => {
          if (finished && active) {
            runEmber();
          }
        })
      );
    };

    runEmber();
    return () => {
      active = false;
    };
  }, [delay, startX, driftX, opacity, scale, x, y]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: x.value,
      top: y.value,
      width: 3.5,
      height: 3.5,
      borderRadius: 1.75,
      backgroundColor: '#FFA000',
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return <Animated.View style={animatedStyle} />;
}

export default function Flame({ score }: FlameProps) {
  const { vowLogs } = useAppStore();

  // Watch completed count to trigger pulse
  const completedCount = Object.values(vowLogs).filter(Boolean).length;
  const prevCompletedCountRef = useRef(completedCount);
  const [pulseActive, setPulseActive] = useState(false);
  const [completionId, setCompletionId] = useState(0);

  // Shared values for breathing animations
  const outerBreath = useSharedValue(1);
  const middleBreath = useSharedValue(1);
  const innerBreath = useSharedValue(1);

  // Shared values for sway/rotation
  const outerRotate = useSharedValue(0);
  const middleRotate = useSharedValue(0);
  const innerRotate = useSharedValue(0);

  // Shared values for completions
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (completedCount > prevCompletedCountRef.current) {
      setPulseActive(true);
      setCompletionId(prev => prev + 1);
      
      pulseScale.value = withSequence(
        withTiming(1.25, { duration: 180, easing: Easing.out(Easing.quad) }),
        withTiming(0.92, { duration: 150, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.08, { duration: 150, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.97, { duration: 120 }),
        withTiming(1.0, { duration: 100 }, () => {
          pulseScale.value = 1;
        })
      );

      const timer = setTimeout(() => setPulseActive(false), 1200);
      prevCompletedCountRef.current = completedCount;
      return () => clearTimeout(timer);
    } else {
      prevCompletedCountRef.current = completedCount;
    }
  }, [completedCount, pulseScale]);

  // Adjust breathing speeds dynamically based on discipline score
  useEffect(() => {
    const breathDur = 4.5 - (score / 100) * 2.0;

    outerBreath.value = withRepeat(
      withTiming(1.02, { duration: (breathDur * 1.3) * 1000 / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    middleBreath.value = withRepeat(
      withTiming(1.04, { duration: breathDur * 1000 / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    innerBreath.value = withRepeat(
      withTiming(1.03, { duration: (breathDur * 0.8) * 1000 / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    outerRotate.value = withRepeat(
      withTiming(1.5, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    middleRotate.value = withRepeat(
      withTiming(-2.0, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    innerRotate.value = withRepeat(
      withTiming(1.0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [score, outerBreath, middleBreath, innerBreath, outerRotate, middleRotate, innerRotate]);

  // Calculate baseline values based on discipline score
  const baseScale = 0.5 + (score / 100) * 0.5;
  const opacity = 0.45 + (score / 100) * 0.55;
  const glowRadius = 15 + (score / 100) * 25;

  // Reanimated style definitions for a 160x160 frame
  // Center of 160x160 is (80, 80).
  const outerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: 70 }, // Outer base is at y = 150 (offset = 70)
        { scale: baseScale * outerBreath.value * pulseScale.value },
        { rotate: `${outerRotate.value}deg` },
        { translateY: -70 }
      ]
    };
  });

  const middleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: 65 }, // Middle base is at y = 145 (offset = 65)
        { scale: baseScale * middleBreath.value * pulseScale.value },
        { rotate: `${middleRotate.value}deg` },
        { translateY: -65 }
      ]
    };
  });

  const innerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: 60 }, // Inner base is at y = 140 (offset = 60)
        { scale: baseScale * innerBreath.value * pulseScale.value },
        { rotate: `${innerRotate.value}deg` },
        { translateY: -60 }
      ]
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: baseScale * middleBreath.value * pulseScale.value }
      ],
      opacity: opacity * 0.15,
    };
  });

  return (
    <View style={styles.container}>
      {/* Background glow shadow backdrop */}
      <Animated.View 
        style={[
          styles.glowBack, 
          glowStyle, 
          { 
            shadowRadius: glowRadius,
            shadowColor: theme.colors.primary,
            backgroundColor: theme.colors.primary,
          }
        ]} 
      />

      {/* Layer 1: Outer Flame */}
      <Animated.View style={[StyleSheet.absoluteFill, outerStyle]}>
        <Canvas style={styles.canvas}>
          <Path
            path="M 80 150 C 40 120, 20 80, 80 10 C 140 80, 120 120, 80 150 Z"
            opacity={opacity * 0.7}
          >
            <LinearGradient
              start={vec(80, 150)}
              end={vec(80, 10)}
              colors={['#8A2E2E', theme.colors.primary]}
            />
          </Path>
        </Canvas>
      </Animated.View>

      {/* Layer 2: Middle Flame */}
      <Animated.View style={[StyleSheet.absoluteFill, middleStyle]}>
        <Canvas style={styles.canvas}>
          <Path
            path="M 80 145 C 50 115, 35 85, 80 30 C 125 85, 110 115, 80 145 Z"
            opacity={opacity * 0.9}
          >
            <LinearGradient
              start={vec(80, 145)}
              end={vec(80, 30)}
              colors={[theme.colors.primary, '#FF9F00']}
            />
          </Path>
        </Canvas>
      </Animated.View>

      {/* Layer 3: Inner Core */}
      <Animated.View style={[StyleSheet.absoluteFill, innerStyle]}>
        <Canvas style={styles.canvas}>
          <Path
            path="M 80 140 C 60 110, 50 90, 80 50 C 110 90, 100 110, 80 140 Z"
            opacity={opacity}
          >
            <LinearGradient
              start={vec(80, 140)}
              end={vec(80, 50)}
              colors={['#FF9F00', '#FFFFFF']}
            />
          </Path>
        </Canvas>
      </Animated.View>

      {/* Floating ambient embers */}
      <Ember delay={0} startX={80} driftX={-20} />
      <Ember delay={700} startX={88} driftX={15} />
      <Ember delay={1300} startX={72} driftX={-12} />
      <Ember delay={2000} startX={82} driftX={8} />
      <Ember delay={2800} startX={76} driftX={-4} />

      {/* Transient spark group triggered on completion */}
      {pulseActive && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 8 }).map((_, i) => (
            <Spark key={`${completionId}-${i}`} index={i} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowBack: {
    width: 110,
    height: 110,
    borderRadius: 55,
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    elevation: 8,
  },
  canvas: {
    width: 160,
    height: 160,
    position: 'absolute',
  },
});
