import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { theme } from '../theme';

export function Text({ style, ...props }: TextProps) {
  return <RNText style={[styles.text, style]} {...props} />;
}

const styles = StyleSheet.create({
  text: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
  },
});
export default Text;
