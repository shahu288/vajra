import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function SunriseIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <path d="M12 2v6" />
      <path d="M4.93 10.93l4.24 4.24" />
      <path d="M2 18h20" />
      <path d="M20 18a8 8 0 0 0-16 0" />
      <path d="M19.07 10.93l-4.24 4.24" />
      <path d="M22 22H2" />
    </svg>
  );
}

export function DumbbellIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="m18 22 4-4" />
      <path d="m2 6 4-4" />
      <path d="m3 10 7-7" />
      <path d="m14 21 7-7" />
    </svg>
  );
}

export function BookIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

export function LotusIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <path d="M12 3c-2.5 3-4 6.5-4 9.5 0 2.5 1.5 4.5 4 4.5s4-2 4-4.5C16 9.5 14.5 6 12 3z" />
      <path d="M12 17c-4 0-8-2-10-6 4 0 7 2 10 6z" />
      <path d="M12 17c4 0 8-2 10-6-4 0-7 2-10 6z" />
      <path d="M5 19c3-1 5-3 7-6" />
      <path d="M19 19c-3-1-5-3-7-6" />
    </svg>
  );
}

export function PhoneIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2" />
    </svg>
  );
}

export function MoonIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
    </svg>
  );
}

export function WaterIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

export function PenIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

export function RunnerIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <circle cx="15" cy="4" r="2" />
      <path d="M9 20l3-7-3-2 4-4 3 2 4-2" />
      <path d="M6 13l3-2 3 3-2 5" />
    </svg>
  );
}

export function ShieldIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function BrainIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z" />
    </svg>
  );
}

export function LightningIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function HeartIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function CoinIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10" />
      <path d="M15 9.5a2.5 2.5 0 0 0-5 0c0 2 5 2 5 4a2.5 2.5 0 0 1-5 0" />
    </svg>
  );
}

export function PaletteIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <circle cx="13.5" cy="6.5" r=".5" />
      <circle cx="17.5" cy="10.5" r=".5" />
      <circle cx="8.5" cy="7.5" r=".5" />
      <circle cx="6.5" cy="12.5" r=".5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.75 1.7-1.67 0-.42-.16-.8-.44-1.08-.28-.28-.44-.66-.44-1.08 0-.92.75-1.67 1.67-1.67H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z" />
    </svg>
  );
}

export function LockIcon({ size = 20, color = '#D4AF37', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function CheckIcon({ size = 16, color = '#0D0D0E', strokeWidth = 2.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function getVowVectorIcon(name: string, color = '#D4AF37', size = 20) {
  const lower = name.toLowerCase();
  if (lower.includes('wake') || lower.includes('dawn') || lower.includes('early')) return <SunriseIcon size={size} color={color} />;
  if (lower.includes('workout') || lower.includes('pushup') || lower.includes('gym')) return <DumbbellIcon size={size} color={color} />;
  if (lower.includes('read') || lower.includes('pages') || lower.includes('book') || lower.includes('study')) return <BookIcon size={size} color={color} />;
  if (lower.includes('meditate') || lower.includes('mindful') || lower.includes('reflection') || lower.includes('breath')) return <LotusIcon size={size} color={color} />;
  if (lower.includes('social') || lower.includes('phone') || lower.includes('digital') || lower.includes('screen')) return <PhoneIcon size={size} color={color} />;
  if (lower.includes('sleep') || lower.includes('bed') || lower.includes('night')) return <MoonIcon size={size} color={color} />;
  if (lower.includes('water') || lower.includes('hydrate') || lower.includes('shower')) return <WaterIcon size={size} color={color} />;
  if (lower.includes('journal') || lower.includes('write') || lower.includes('words')) return <PenIcon size={size} color={color} />;
  if (lower.includes('run') || lower.includes('jog') || lower.includes('steps')) return <RunnerIcon size={size} color={color} />;
  if (lower.includes('stretch') || lower.includes('mobility') || lower.includes('fast')) return <LotusIcon size={size} color={color} />;
  if (lower.includes('sugar') || lower.includes('diet') || lower.includes('food') || lower.includes('health')) return <HeartIcon size={size} color={color} />;
  if (lower.includes('money') || lower.includes('save') || lower.includes('expense') || lower.includes('buying')) return <CoinIcon size={size} color={color} />;
  if (lower.includes('create') || lower.includes('design') || lower.includes('instrument') || lower.includes('art')) return <PaletteIcon size={size} color={color} />;
  return <LotusIcon size={size} color={color} />;
}

export function getCategoryVectorIcon(categoryKey: string, color = '#D4AF37', size = 18) {
  if (categoryKey.includes('Body')) return <DumbbellIcon size={size} color={color} />;
  if (categoryKey.includes('Mind')) return <LotusIcon size={size} color={color} />;
  if (categoryKey.includes('Learning')) return <BookIcon size={size} color={color} />;
  if (categoryKey.includes('Productivity')) return <LightningIcon size={size} color={color} />;
  if (categoryKey.includes('Digital')) return <PhoneIcon size={size} color={color} />;
  if (categoryKey.includes('Health')) return <HeartIcon size={size} color={color} />;
  if (categoryKey.includes('Sleep')) return <MoonIcon size={size} color={color} />;
  if (categoryKey.includes('Money')) return <CoinIcon size={size} color={color} />;
  if (categoryKey.includes('Relationships')) return <HeartIcon size={size} color={color} />;
  if (categoryKey.includes('Spiritual')) return <LotusIcon size={size} color={color} />;
  if (categoryKey.includes('Creativity')) return <PaletteIcon size={size} color={color} />;
  return <PenIcon size={size} color={color} />;
}



