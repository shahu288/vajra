import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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
import { Text } from './Text';

interface FlameProps {
  score: number;
  displayName?: string;
}

function Spark({ index }: { index: number }) {
  const x = useSharedValue(82);
  const y = useSharedValue(106);
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
    x.value = withTiming(82 + target.dx, { duration: 1200, easing: Easing.out(Easing.quad) });
    y.value = withTiming(106 + target.dy, { duration: 1200, easing: Easing.out(Easing.quad) });
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
      backgroundColor: '#F2EFEA',
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return <Animated.View style={animatedStyle} />;
}

function Ember({ delay, startX, driftX }: { delay: number; startX: number; driftX: number }) {
  const y = useSharedValue(106);
  const x = useSharedValue(startX);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    let active = true;
    const runEmber = () => {
      if (!active) return;
      y.value = 106;
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
        withTiming(30, { duration: 3000, easing: Easing.inOut(Easing.ease) })
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
      backgroundColor: '#F3BA45',
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return <Animated.View style={animatedStyle} />;
}

export default function Flame({ score, displayName }: FlameProps) {
  const { vowLogs, activeVows } = useAppStore();

  const completedVowsCount = activeVows.filter(v => vowLogs[v.id] === true).length;
  const lapsedCount = activeVows.filter(v => vowLogs[v.id] === false).length;
  const totalVows = activeVows.length;

  const allCompleted = totalVows > 0 && completedVowsCount === totalVows;
  const hasLapsed = lapsedCount > 0;

  let scaleModifier = 1.0;
  let opacityModifier = 1.0;
  let speedModifier = 1.0;
  let glowModifier = 1.0;
  let emberCount = 5;

  if (allCompleted) {
    scaleModifier = 1.15;
    opacityModifier = 1.1;
    speedModifier = 0.7;
    glowModifier = 1.3;
    emberCount = 8;
  } else if (hasLapsed) {
    scaleModifier = 0.65;
    opacityModifier = 0.6;
    speedModifier = 1.6;
    glowModifier = 0.45;
    emberCount = 2;
  }

  const prevCompletedCountRef = useRef(completedVowsCount);
  const [pulseActive, setPulseActive] = useState(false);
  const [completionId, setCompletionId] = useState(0);

  const outerBreath = useSharedValue(1);
  const middleBreath = useSharedValue(1);
  const innerBreath = useSharedValue(1);

  const outerRotate = useSharedValue(0);
  const middleRotate = useSharedValue(0);
  const innerRotate = useSharedValue(0);

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (completedVowsCount > prevCompletedCountRef.current) {
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
      prevCompletedCountRef.current = completedVowsCount;
      return () => clearTimeout(timer);
    } else {
      prevCompletedCountRef.current = completedVowsCount;
    }
  }, [completedVowsCount, pulseScale]);

  const baseScale = 0.5 + (score / 100) * 0.5;
  const finalScale = Math.max(0.35, Math.min(1.2, baseScale * scaleModifier));

  const opacity = 0.45 + (score / 100) * 0.55;
  const finalOpacity = Math.max(0.35, Math.min(1.0, opacity * opacityModifier));

  const breathDur = 4.5 - (score / 100) * 2.0;
  const finalBreathDur = Math.max(1.8, Math.min(6.0, breathDur * speedModifier));

  const glowRadius = 15 + (score / 100) * 25;
  const finalGlowRadius = Math.max(8, Math.min(50, glowRadius * glowModifier));

  useEffect(() => {
    outerBreath.value = withRepeat(
      withTiming(1.02, { duration: (finalBreathDur * 1.3) * 1000 / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    middleBreath.value = withRepeat(
      withTiming(1.04, { duration: finalBreathDur * 1000 / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    innerBreath.value = withRepeat(
      withTiming(1.03, { duration: (finalBreathDur * 0.8) * 1000 / 2, easing: Easing.inOut(Easing.ease) }),
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
  }, [finalBreathDur, outerBreath, middleBreath, innerBreath, outerRotate, middleRotate, innerRotate]);

  const outerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: 26 }, // Pivot at wick tip y = 106
        { scale: finalScale * outerBreath.value * pulseScale.value },
        { rotate: `${outerRotate.value}deg` },
        { translateY: -12 }
      ]
    };
  });

  const middleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: 26 },
        { scale: finalScale * middleBreath.value * pulseScale.value },
        { rotate: `${middleRotate.value}deg` },
        { translateY: -12 }
      ]
    };
  });

  const innerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: 26 },
        { scale: finalScale * innerBreath.value * pulseScale.value },
        { rotate: `${innerRotate.value}deg` },
        { translateY: -12 }
      ]
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: finalScale * middleBreath.value * pulseScale.value }
      ],
      opacity: finalOpacity * 0.18,
    };
  });

  const allEmbers = [
    { delay: 0, startX: 80, driftX: -20 },
    { delay: 700, startX: 88, driftX: 15 },
    { delay: 1300, startX: 72, driftX: -12 },
    { delay: 2000, startX: 82, driftX: 8 },
    { delay: 2800, startX: 76, driftX: -4 },
    { delay: 400, startX: 84, driftX: 12 },
    { delay: 1000, startX: 78, driftX: -15 },
    { delay: 1800, startX: 74, driftX: 5 },
  ];

  const visibleEmbers = allEmbers.slice(0, emberCount);

  return (
    <View style={styles.container}>
      {/* Background glow shadow backdrop */}
      <Animated.View 
        style={[
          styles.glowBack, 
          glowStyle, 
          { 
            shadowRadius: finalGlowRadius,
            shadowColor: '#F3BA45',
            backgroundColor: '#F3BA45',
          }
        ]} 
      />

      {/* Static Candle Pedestal & Matte Ceramic Cup */}
      <Canvas style={styles.canvas}>
        {/* 1. Pedestal Base */}
        <Path path="M 40 143 Q 82 150, 124 143 L 122 146 Q 82 152, 42 146 Z">
          <LinearGradient
            start={vec(40, 143)}
            end={vec(124, 143)}
            colors={['#14171C', '#1C2027', '#14171C']}
          />
        </Path>
        
        {/* 2. Ceramic Container */}
        <Path path="M 54 112 C 54 128, 58 139, 82 139 C 106 139, 110 128, 110 112 Z">
          <LinearGradient
            start={vec(82, 112)}
            end={vec(82, 139)}
            colors={['#1C2027', '#14171C', '#0B0C0E']}
          />
        </Path>

        {/* Rim Inner Depth */}
        <Path path="M 54 112 Q 82 115, 110 112 Q 82 109, 54 112 Z" color="#262A33" strokeWidth={0.5} style="stroke" />

        {/* Wick */}
        <Path path="M 82 112 C 82 109, 83 107, 83 106" strokeWidth={2} style="stroke" strokeCap="round" color="#121212" />
      </Canvas>

      {/* Subtle Engraved Moniker */}
      <View style={styles.engravingContainer} pointerEvents="none">
        <Text style={styles.engravedText}>
          {displayName ? displayName.toUpperCase() : 'VAJRA'}
        </Text>
      </View>

      {/* Layer 1: Outer Flame */}
      <Animated.View style={[StyleSheet.absoluteFill, outerStyle]}>
        <Canvas style={styles.canvas}>
          <Path
            path="M 82 92 C 52 75, 42 45, 82 12 C 122 45, 112 75, 82 92 Z"
            opacity={finalOpacity * 0.7}
          >
            <LinearGradient
              start={vec(82, 92)}
              end={vec(82, 12)}
              colors={['#A33A3A', '#F3BA45']}
            />
          </Path>
        </Canvas>
      </Animated.View>

      {/* Layer 2: Middle Flame */}
      <Animated.View style={[StyleSheet.absoluteFill, middleStyle]}>
        <Canvas style={styles.canvas}>
          <Path
            path="M 82 92 C 60 78, 52 55, 82 24 C 112 55, 104 78, 82 92 Z"
            opacity={finalOpacity * 0.9}
          >
            <LinearGradient
              start={vec(82, 92)}
              end={vec(82, 24)}
              colors={['#F3BA45', '#FFE48A']}
            />
          </Path>
        </Canvas>
      </Animated.View>

      {/* Layer 3: Inner Core */}
      <Animated.View style={[StyleSheet.absoluteFill, innerStyle]}>
        <Canvas style={styles.canvas}>
          <Path
            path="M 82 92 C 68 82, 62 65, 82 38 C 102 65, 96 82, 82 92 Z"
            opacity={finalOpacity}
          >
            <LinearGradient
              start={vec(82, 92)}
              end={vec(82, 38)}
              colors={['#FFE48A', '#FFFFFF']}
            />
          </Path>
        </Canvas>
      </Animated.View>

      {/* Floating ambient embers */}
      {visibleEmbers.map((ember, i) => (
        <Ember key={i} delay={ember.delay} startX={ember.startX} driftX={ember.driftX} />
      ))}

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
  engravingContainer: {
    position: 'absolute',
    left: 40,
    width: 84,
    top: 119,
    alignItems: 'center',
    justifyContent: 'center',
  },
  engravedText: {
    fontSize: 6.5,
    fontFamily: theme.typography.fontFamily.displayBold,
    color: '#F3BA45',
    opacity: 0.75,
    letterSpacing: 2,
    fontWeight: 'bold',
    textAlign: 'center',
    ...Platform.select({
      web: {
        textShadow: '0 0.5px 0.5px rgba(0,0,0,0.5)',
      }
    })
  },
});
