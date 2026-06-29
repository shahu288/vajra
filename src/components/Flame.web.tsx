import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { useAppStore } from '../store/useAppStore';

interface FlameProps {
  score: number;
}

export default function Flame({ score }: FlameProps) {
  const { vowLogs } = useAppStore();

  // Calculate completed vows to trigger pulse animation
  const completedCount = Object.values(vowLogs).filter(Boolean).length;
  const prevCompletedCountRef = useRef(completedCount);
  const [pulseActive, setPulseActive] = useState(false);

  useEffect(() => {
    if (completedCount > prevCompletedCountRef.current) {
      setPulseActive(true);
      const timer = setTimeout(() => setPulseActive(false), 1200);
      prevCompletedCountRef.current = completedCount;
      return () => clearTimeout(timer);
    } else {
      prevCompletedCountRef.current = completedCount;
    }
  }, [completedCount]);

  // Calculate flame characteristics based on discipline score (0 - 100)
  const baseScale = 0.5 + (score / 100) * 0.5; // ranges from 0.5 to 1.0
  const opacity = 0.45 + (score / 100) * 0.55; // ranges from 0.45 to 1.0
  const breathDur = 4.5 - (score / 100) * 2.0; // ranges from 4.5s (calm) to 2.5s (energized)
  const glowRadius = 15 + (score / 100) * 25; // ranges from 15px to 40px glow

  return (
    <View style={styles.container}>
      {/* Background soft glow aura */}
      <View 
        style={[
          styles.glowBack, 
          { 
            transform: [{ scale: baseScale }], 
            opacity: opacity * 0.15,
            shadowRadius: glowRadius,
            shadowColor: theme.colors.primary,
          }
        ]} 
      />

      <svg 
        width="160" 
        height="160" 
        viewBox="0 0 160 160" 
        style={{ 
          position: 'absolute',
          transformOrigin: '80px 145px',
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: `scale(${baseScale})`
        }}
      >
        <defs>
          {/* Custom gradients for rich depth */}
          <radialGradient id="auraGlow" cx="50%" cy="80%" r="50%">
            <stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.4" />
            <stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0" />
          </radialGradient>

          <linearGradient id="outerFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#8A2E2E" stopOpacity="0.85" />
            <stop offset="40%" stopColor={theme.colors.primary} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFA000" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="middleFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={theme.colors.primary} />
            <stop offset="70%" stopColor="#FF9F00" />
            <stop offset="100%" stopColor="#FFE082" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="innerFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FF9F00" />
            <stop offset="60%" stopColor="#FFE082" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          <style>{`
            /* Meditative slow breathing keyframes */
            @keyframes breathe-outer {
              0% { transform: scale(1) rotate(0deg) skewX(0deg); }
              33% { transform: scale(1.02, 0.98) rotate(1deg) skewX(1deg); }
              66% { transform: scale(0.98, 1.03) rotate(-1deg) skewX(-1deg); }
              100% { transform: scale(1) rotate(0deg) skewX(0deg); }
            }

            @keyframes breathe-middle {
              0% { transform: scale(1) rotate(0deg); }
              50% { transform: scale(1.04, 1.06) rotate(-2deg); }
              100% { transform: scale(1) rotate(0deg); }
            }

            @keyframes breathe-inner {
              0% { transform: scale(1) translateY(0); }
              50% { transform: scale(1.02, 1.06) translateY(-1px); }
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
              15% { transform: scale(1.25); filter: brightness(1.3) drop-shadow(0 0 12px ${theme.colors.primary}); }
              30% { transform: scale(0.92); filter: brightness(0.95); }
              50% { transform: scale(1.06); filter: brightness(1.05); }
              70% { transform: scale(0.98); }
              100% { transform: scale(1); filter: brightness(1); }
            }

            /* Infinite background ember drift */
            @keyframes ember-float {
              0% {
                transform: translate(var(--x-start), 145px) scale(0);
                opacity: 0;
              }
              15% {
                opacity: 0.7;
              }
              50% {
                transform: translate(calc(var(--x-start) + var(--x-drift) * 0.5), 85px) scale(1.1);
              }
              85% {
                opacity: 0.6;
              }
              100% {
                transform: translate(calc(var(--x-start) + var(--x-drift)), var(--y-end)) scale(0);
                opacity: 0;
              }
            }

            .outer-layer {
              transform-origin: 80px 145px;
              animation: breathe-outer ${breathDur * 1.3}s ease-in-out infinite, flicker-subtle 4s ease-in-out infinite;
            }

            .middle-layer {
              transform-origin: 80px 145px;
              animation: breathe-middle ${breathDur}s ease-in-out infinite, flicker-subtle 3s ease-in-out infinite;
            }

            .inner-layer {
              transform-origin: 80px 140px;
              animation: breathe-inner ${breathDur * 0.8}s ease-in-out infinite, flicker-subtle 1.8s ease-in-out infinite;
            }

            .pulse-active {
              transform-origin: 80px 145px;
              animation: completed-pulse 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards !important;
            }

            /* Ambient embers styling */
            .ember-particle {
              fill: #FFA000;
              filter: blur(0.4px);
              opacity: 0;
              animation: ember-float var(--dur) ease-in-out infinite;
              animation-delay: var(--delay);
            }

            /* Transient spark animations for completions */
            .spark-group .spark {
              opacity: 0;
              fill: #FFF59D;
              filter: drop-shadow(0 0 3px ${theme.colors.primary});
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

            @keyframes spark-out-0 { 0% { transform: translate(80px, 130px) scale(1); opacity: 1; } 100% { transform: translate(45px, 45px) scale(0); opacity: 0; } }
            @keyframes spark-out-1 { 0% { transform: translate(80px, 130px) scale(1); opacity: 1; } 100% { transform: translate(110px, 35px) scale(0); opacity: 0; } }
            @keyframes spark-out-2 { 0% { transform: translate(80px, 130px) scale(1); opacity: 1; } 100% { transform: translate(70px, 25px) scale(0); opacity: 0; } }
            @keyframes spark-out-3 { 0% { transform: translate(80px, 130px) scale(1); opacity: 1; } 100% { transform: translate(120px, 65px) scale(0); opacity: 0; } }
            @keyframes spark-out-4 { 0% { transform: translate(80px, 130px) scale(1); opacity: 1; } 100% { transform: translate(40px, 75px) scale(0); opacity: 0; } }
            @keyframes spark-out-5 { 0% { transform: translate(80px, 130px) scale(1); opacity: 1; } 100% { transform: translate(95px, 50px) scale(0); opacity: 0; } }
            @keyframes spark-out-6 { 0% { transform: translate(80px, 130px) scale(1); opacity: 1; } 100% { transform: translate(60px, 30px) scale(0); opacity: 0; } }
            @keyframes spark-out-7 { 0% { transform: translate(80px, 130px) scale(1); opacity: 1; } 100% { transform: translate(85px, 55px) scale(0); opacity: 0; } }
          `}</style>
        </defs>

        {/* Ambient background aura glow */}
        <circle cx="80" cy="100" r="50" fill="url(#auraGlow)" />

        {/* Dynamic, responsive, and interactive flame layers */}
        <g className={pulseActive ? 'pulse-active' : ''} style={{ transformOrigin: '80px 145px' }}>
          
          {/* Layer 1: Soft Outer Flame Halo */}
          <path
            className="outer-layer"
            d="M 80 150 C 40 120, 20 80, 80 10 C 140 80, 120 120, 80 150 Z"
            fill="url(#outerFlameGrad)"
            opacity={opacity * 0.7}
          />

          {/* Layer 2: Main Body Flame */}
          <path
            className="middle-layer"
            d="M 80 145 C 50 115, 35 85, 80 30 C 125 85, 110 115, 80 145 Z"
            fill="url(#middleFlameGrad)"
            opacity={opacity * 0.9}
          />

          {/* Layer 3: Intense Inner Focus Core */}
          <path
            className="inner-layer"
            d="M 80 140 C 60 110, 50 90, 80 50 C 110 90, 100 110, 80 140 Z"
            fill="url(#innerFlameGrad)"
            opacity={opacity}
          />
        </g>

        {/* Loop-based ambient embers floating upwards */}
        <circle className="ember-particle" cx="0" cy="0" r="1.5" style={{ '--x-start': '80px', '--y-end': '20px', '--x-drift': '-20px', '--dur': '3.4s', '--delay': '0.0s' } as any} />
        <circle className="ember-particle" cx="0" cy="0" r="2.0" style={{ '--x-start': '88px', '--y-end': '10px', '--x-drift': '15px', '--dur': '2.8s', '--delay': '0.7s' } as any} />
        <circle className="ember-particle" cx="0" cy="0" r="1.2" style={{ '--x-start': '72px', '--y-end': '30px', '--x-drift': '-12px', '--dur': '4.1s', '--delay': '1.3s' } as any} />
        <circle className="ember-particle" cx="0" cy="0" r="1.8" style={{ '--x-start': '82px', '--y-end': '15px', '--x-drift': '8px', '--dur': '3.2s', '--delay': '2.0s' } as any} />
        <circle className="ember-particle" cx="0" cy="0" r="1.6" style={{ '--x-start': '76px', '--y-end': '25px', '--x-drift': '-4px', '--dur': '3.7s', '--delay': '2.8s' } as any} />

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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    elevation: 8,
    backgroundColor: 'transparent',
  },
});
