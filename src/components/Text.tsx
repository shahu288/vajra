import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTheme, typography } from '../theme';

export function Text({ style, ...props }: TextProps) {
  const { colors } = useTheme();

  return <RNText style={[{ color: colors.text.primary, fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.regular }, style]} {...props} />;
}

export default Text;
