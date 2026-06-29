import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';
import { theme } from '../theme';

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(11, 11, 18, 0.75)', // Transparent dark luxury base
    borderColor: theme.colors.border.lowContrast,
    borderWidth: 0.5,
    borderRadius: theme.spacing.borderRadius.card,
    padding: theme.spacing.md,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      }
    })
  },
});
export default Card;
