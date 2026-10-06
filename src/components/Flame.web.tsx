import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { useAppStore } from '../store/useAppStore';

interface FlameProps {
  score?: number;
  displayName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Flame({ score, displayName, size = 'md' }: FlameProps) {
  const { user, vowLogs, activeVows } = useAppStore();
  
  const rawScore = typeof score === 'number' && !isNaN(score) ? score : (user?.discipline_score || 75);
  const safeScore = Math.max(0, Math.min(100, rawScore));


  // Watch completed count to trigger pulse
  const completedVowsCount = activeVows.filter(v => vowLogs[v.id] === true).length;
  const lapsedCount = activeVows.filter(v => vowLogs[v.id] === false).length;
  const totalVows = activeVows.length;

  const allCompleted = totalVows > 0 && completedVowsCount === totalVows;
  const hasLapsed = lapsedCount > 0;

  // Modifiers based on today's vows
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

  useEffect(() => {
    if (completedVowsCount > prevCompletedCountRef.current) {
      setPulseActive(true);
      const timer = setTimeout(() => setPulseActive(false), 1200);
      prevCompletedCountRef.current = completedVowsCount;
      return () => clearTimeout(timer);
    } else {
      prevCompletedCountRef.current = completedVowsCount;
    }
  }, [completedVowsCount]);

  // Calculate baseline characteristics based on discipline score (0 - 100)
  const baseScale = 0.5 + (safeScore / 100) * 0.5; // ranges from 0.5 to 1.0
  const finalScale = Math.max(0.35, Math.min(1.2, baseScale * scaleModifier));

  const opacity = 0.45 + (safeScore / 100) * 0.55; // ranges from 0.45 to 1.0
  const finalOpacity = Math.max(0.35, Math.min(1.0, opacity * opacityModifier));

  const breathDur = 4.5 - (safeScore / 100) * 2.0; // ranges from 4.5s (calm) to 2.5s (energized)
  const finalBreathDur = Math.max(1.8, Math.min(6.0, breathDur * speedModifier));

  const glowRadius = 15 + (safeScore / 100) * 25; // ranges from 15px to 40px glow
  const finalGlowRadius = Math.max(8, Math.min(50, glowRadius * glowModifier));

  const allEmbers = [
    { r: 1.5, start: '80px', end: '34px', drift: '-20px', dur: '3.4s', delay: '0.0s' },
    { r: 2.0, start: '88px', end: '24px', drift: '15px', dur: '2.8s', delay: '0.7s' },
    { r: 1.2, start: '72px', end: '44px', drift: '-12px', dur: '4.1s', delay: '1.3s' },
    { r: 1.8, start: '82px', end: '29px', drift: '8px', dur: '3.2s', delay: '2.0s' },
    { r: 1.6, start: '76px', end: '39px', drift: '-4px', dur: '3.7s', delay: '2.8s' },
    // Extra embers for allCompleted
    { r: 1.4, start: '84px', end: '26px', drift: '12px', dur: '2.4s', delay: '0.4s' },
    { r: 1.7, start: '78px', end: '32px', drift: '-15px', dur: '2.9s', delay: '1.0s' },
    { r: 1.3, start: '74px', end: '36px', drift: '5px', dur: '3.3s', delay: '1.8s' },
  ];

  const visibleEmbers = allEmbers.slice(0, emberCount);

  return (
    <View style={styles.container}>
      {/* Background soft glow aura using theme primary (Warm Amber) */}
      <View 
        style={[
          styles.glowBack, 
          { 
            transform: [{ scale: finalScale }], 
            opacity: finalOpacity * 0.18,
            shadowRadius: finalGlowRadius,
            shadowColor: '#F3BA45',
          }
        ]} 
      />

      <svg 
        width="160" 
        height="160" 
        viewBox="0 0 160 160" 
        style={{ 
          position: 'absolute',
        }}
      >
        <defs>
          {/* Custom gradients for rich depth */}
          <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F3BA45" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F3BA45" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="outerFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#A33A3A" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#F3BA45" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFE48A" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="middleFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F3BA45" />
            <stop offset="70%" stopColor="#F3BA45" />
            <stop offset="100%" stopColor="#FFE48A" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="innerFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F3BA45" />
            <stop offset="60%" stopColor="#FFE48A" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* Ceramic Cup Matte Gradient */}
          <linearGradient id="ceramicGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1C2027" />
            <stop offset="50%" stopColor="#14171C" />
            <stop offset="100%" stopColor="#0B0C0E" />
          </linearGradient>

          {/* Stone Slab Base Gradient */}
          <linearGradient id="stoneSlabGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14171C" />
            <stop offset="50%" stopColor="#1C2027" />
            <stop offset="100%" stopColor="#14171C" />
          </linearGradient>

          <style>{`
            /* Meditative slow breathing keyframes */
            @keyframes breathe-outer {
              0% { transform: scale(1) rotate(0deg) skewX(0deg); }
              33% { transform: scale(1.02, 0.98) rotate(1deg) skewX(0.5deg); }
              66% { transform: scale(0.98, 1.03) rotate(-1deg) skewX(-0.5deg); }
              100% { transform: scale(1) rotate(0deg) skewX(0deg); }
            }

            @keyframes breathe-middle {
              0% { transform: scale(1) rotate(0deg); }
              50% { transform: scale(1.03, 1.05) rotate(-1.5deg); }
              100% { transform: scale(1) rotate(0deg); }
            }

            @keyframes breathe-inner {
              0% { transform: scale(1) translateY(0); }
              50% { transform: scale(1.01, 1.04) translateY(-1px); }
              100% { transform: scale(1) translateY(0); }
            }

            /* Natural organic micro-flickering */
            @keyframes flicker-subtle {
              0%, 100% { opacity: 0.97; }
              20% { opacity: 1; }
              40% { opacity: 0.94; }
              60% { opacity: 0.99; }
              80% { opacity: 0.95; }
            }

            /* Vow completion spring-pulse keyframes */
            @keyframes completed-pulse {
              0% { transform: scale(1); filter: brightness(1); }
              15% { transform: scale(1.2); filter: brightness(1.25) drop-shadow(0 0 10px #F3BA45); }
              30% { transform: scale(0.94); filter: brightness(0.97); }
              50% { transform: scale(1.04); filter: brightness(1.03); }
              70% { transform: scale(0.99); }
              100% { transform: scale(1); filter: brightness(1); }
            }

            /* Infinite background ember drift */
            @keyframes ember-float {
              0% {
                transform: translate(var(--x-start), 106px) scale(0);
                opacity: 0;
              }
              25% {
                opacity: 0.85;
              }
              75% {
                opacity: 0.6;
              }
              100% {
                transform: translate(var(--x-end), -20px) scale(1);
                opacity: 0;
              }
            }

            .outer-layer {
              transform-origin: 82px 106px;
              transform-box: view-box;
              animation: breathe-outer ${finalBreathDur * 1.3}s ease-in-out infinite, flicker-subtle 4s ease-in-out infinite;
            }

            .middle-layer {
              transform-origin: 82px 106px;
              transform-box: view-box;
              animation: breathe-middle ${finalBreathDur}s ease-in-out infinite, flicker-subtle 3s ease-in-out infinite;
            }

            .inner-layer {
              transform-origin: 82px 106px;
              transform-box: view-box;
              animation: breathe-inner ${finalBreathDur * 0.8}s ease-in-out infinite, flicker-subtle 1.8s ease-in-out infinite;
            }

            .pulse-active {
              transform-origin: 82px 106px;
              transform-box: view-box;
              animation: completed-pulse 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards !important;
            }

            /* Ambient embers styling */
            .ember-particle {
              fill: #F3BA45;
              filter: blur(0.4px);
              opacity: 0;
              animation: ember-float var(--dur) ease-in-out infinite;
              animation-delay: var(--delay);
            }

            /* Transient spark animations for completions */
            .spark-group .spark {
              opacity: 0;
              fill: #F5F6F8;
              filter: drop-shadow(0 0 3px #F3BA45);
            }

            .spark-group.active .spark {
              animation-play-state: running;
            }

            .spark-group.active .spark-0 { animation: spark-out-0 1.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
            .spark-group.active .spark-1 { animation: spark-out-1 1.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
            .spark-group.active .spark-2 { animation: spark-out-2 1.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
            .spark-group.active .spark-3 { animation: spark-out-3 1.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
            .spark-group.active .spark-4 { animation: spark-out-4 1.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
            .spark-group.active .spark-5 { animation: spark-out-5 1.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
            .spark-group.active .spark-6 { animation: spark-out-6 1.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
            .spark-group.active .spark-7 { animation: spark-out-7 1.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }

            @keyframes spark-out-0 { 0% { transform: translate(82px, 106px) scale(1); opacity: 1; } 100% { transform: translate(47px, 21px) scale(0); opacity: 0; } }
            @keyframes spark-out-1 { 0% { transform: translate(82px, 106px) scale(1); opacity: 1; } 100% { transform: translate(112px, 14px) scale(0); opacity: 0; } }
            @keyframes spark-out-2 { 0% { transform: translate(82px, 106px) scale(1); opacity: 1; } 100% { transform: translate(72px, 4px) scale(0); opacity: 0; } }
            @keyframes spark-out-3 { 0% { transform: translate(82px, 106px) scale(1); opacity: 1; } 100% { transform: translate(122px, 44px) scale(0); opacity: 0; } }
            @keyframes spark-out-4 { 0% { transform: translate(82px, 106px) scale(1); opacity: 1; } 100% { transform: translate(42px, 54px) scale(0); opacity: 0; } }
            @keyframes spark-out-5 { 0% { transform: translate(82px, 106px) scale(1); opacity: 1; } 100% { transform: translate(97px, 29px) scale(0); opacity: 0; } }
            @keyframes spark-out-6 { 0% { transform: translate(82px, 106px) scale(1); opacity: 1; } 100% { transform: translate(62px, 9px) scale(0); opacity: 0; } }
            @keyframes spark-out-7 { 0% { transform: translate(82px, 106px) scale(1); opacity: 1; } 100% { transform: translate(87px, 34px) scale(0); opacity: 0; } }
          `}</style>
        </defs>

        {/* Ambient background aura glow */}
        <circle cx="82" cy="86" r="45" fill="url(#auraGlow)" />

        {/* 1. Stone/Wood Pedestal Slab */}
        <ellipse cx="82" cy="143" rx="42" ry="7" fill="url(#stoneSlabGrad)" stroke="#262A33" strokeWidth="0.8" />
        <ellipse cx="82" cy="140" rx="40" ry="6" fill="#14171C" opacity="0.9" />

        {/* 2. Matte Ceramic Container / Bowl */}
        <path 
          d="M 54,112 C 54,128 58,139 82,139 C 106,139 110,128 110,112 Z" 
          fill="url(#ceramicGrad)" 
          stroke="#262A33" 
          strokeWidth="0.5" 
        />
        {/* Inside rim outline to give depth to the ceramic container */}
        <ellipse cx="82" cy="112" rx="28" ry="3" fill="#0B0C0E" stroke="#262A33" strokeWidth="0.4" />

        {/* 3. Engraved Moniker on the container */}
        <text 
          x="82" 
          y="126" 
          textAnchor="middle" 
          fill="#F3BA45" 
          opacity="0.75" 
          style={{ 
            fontSize: '6.5px', 
            fontFamily: 'serif', 
            letterSpacing: '2px', 
            fontWeight: 'bold',
            textShadow: '0 0.5px 0.5px rgba(0,0,0,0.5)',
            userSelect: 'none'
          }}
        >
          {displayName ? displayName.toUpperCase() : 'VAJRA'}
        </text>

        {/* 4. Wick */}
        <path d="M 82 112 C 82 109, 83 107, 83 106" stroke="#121212" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* 5. Flame Layers - Shifted down by 14px to align with the wick of the short bowl */}
        <g 
          className={pulseActive ? 'pulse-active' : ''} 
          style={{ 
            transformOrigin: '82px 106px',
            transform: `scale(${finalScale}) translate(0px, 14px)`,
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Layer 1: Soft Outer Flame Halo */}
          <path
            className="outer-layer"
            d="M 82 92 C 52 75, 42 45, 82 12 C 122 45, 112 75, 82 92 Z"
            fill="url(#outerFlameGrad)"
            opacity={finalOpacity * 0.7}
          />

          {/* Layer 2: Main Body Flame */}
          <path
            className="middle-layer"
            d="M 82 92 C 60 78, 52 55, 82 24 C 112 55, 104 78, 82 92 Z"
            fill="url(#middleFlameGrad)"
            opacity={finalOpacity * 0.9}
          />

          {/* Layer 3: Intense Inner Focus Core */}
          <path
            className="inner-layer"
            d="M 82 92 C 68 82, 62 65, 82 38 C 102 65, 96 82, 82 92 Z"
            fill="url(#innerFlameGrad)"
            opacity={finalOpacity}
          />
        </g>

        {/* Ambient embers */}
        {visibleEmbers.map((ember, idx) => (
          <circle
            key={idx}
            className="ember-particle"
            cx="0"
            cy="0"
            r={ember.r}
            style={{
              '--x-start': ember.start,
              '--y-end': ember.end,
              '--x-drift': ember.drift,
              '--dur': ember.dur,
              '--delay': ember.delay,
            } as any}
          />
        ))}

        {/* Transient sparks on vow completion */}
        <g className={pulseActive ? 'spark-group active' : 'spark-group'}>
          {Array.from({ length: 8 }).map((_, i) => (
            <circle
              key={i}
              className={`spark spark-${i}`}
              cx="0"
              cy="0"
              r={1.2 + Math.random() * 1.3}
            />
          ))}
        </g>
      </svg>
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
    backgroundColor: '#F3BA45',
  },
});
