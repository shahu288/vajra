import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';
import { useTheme, spacing } from '../theme';

interface CardProps extends ViewProps {
  className?: string;
  glowColor?: string;
}

export function Card({ style, className, glowColor, ...props }: CardProps) {
  const { colors, isDark } = useTheme();
  const webProps = Platform.OS === 'web' ? { className: `card-hover ${className || ''}` } : {};

  const dynamicCardStyle = {
    backgroundColor: colors.bg.card,
    borderColor: glowColor || colors.border.default,
  };

  return (
    <View 
      style={[
        styles.card, 
        dynamicCardStyle,
        style
      ]} 
      {...webProps} 
      {...props} 
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.12), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
      }
    })
  },
});
export default Card;
