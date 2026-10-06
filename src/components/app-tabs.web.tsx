import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet, Platform } from 'react-native';

import { ThemedText } from './themed-text';
import { Spacing, Fonts } from '@/constants/theme';
import { useTheme } from '@/theme';
import { useAppStore } from '../store/useAppStore';

// Clean geometric icons using standard HTML SVG components on Web
const HomeIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const LogIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const SquadIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ProfileIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

interface CustomTabButtonProps extends TabTriggerSlotProps {
  name: 'index' | 'checkin' | 'squad' | 'profile';
}

export default function AppTabs() {
  const { colors } = useTheme();

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.bg.outerBg }]}>
      <View style={[styles.mobileFrame, { backgroundColor: colors.bg.mobileFrame, borderColor: colors.border.viewport }]}>
        <Tabs style={{ flex: 1, height: '100%' }}>
          <TabSlot style={{ flex: 1, height: '100%' }} />
          <TabList asChild>
            <CustomTabList>
              <TabTrigger name="index" href="/" asChild>
                <TabButton name="index">Home</TabButton>
              </TabTrigger>
              <TabTrigger name="checkin" href="/checkin" asChild>
                <TabButton name="checkin">Log</TabButton>
              </TabTrigger>
              <TabTrigger name="squad" href="/squad" asChild>
                <TabButton name="squad">Squad</TabButton>
              </TabTrigger>
              <TabTrigger name="profile" href="/profile" asChild>
                <TabButton name="profile">Profile</TabButton>
              </TabTrigger>
              <TabTrigger name="codex" href="/codex" style={{ display: 'none' }} />
            </CustomTabList>
          </TabList>
        </Tabs>
      </View>
    </View>
  );
}

export function TabButton({ name, children, isFocused, ...props }: CustomTabButtonProps) {
  const { colors } = useTheme();
  const activeGold = colors.primary;
  const iconColor = isFocused ? activeGold : colors.text.secondary;

  return (
    <Pressable 
      {...props} 
      style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
      {...(Platform.OS === 'web' ? { className: 'hover-glow' } : {})}
    >
      <View style={styles.tabButtonContent}>
        {isFocused && <View style={[styles.activeHalo, { backgroundColor: activeGold + '22' }]} pointerEvents="none" />}
        <View style={styles.iconWrapper}>
          {name === 'index' && <HomeIcon color={iconColor} />}
          {name === 'checkin' && <LogIcon color={iconColor} />}
          {name === 'squad' && <SquadIcon color={iconColor} />}
          {name === 'profile' && <ProfileIcon color={iconColor} />}
        </View>
        <ThemedText
          type="small"
          style={[
            styles.tabButtonLabel,
            { color: isFocused ? activeGold : colors.text.secondary },
            isFocused && styles.tabButtonLabelActive
          ]}
        >
          {children}
        </ThemedText>
        {isFocused && <View style={[styles.activeIndicator, { backgroundColor: activeGold }]} />}
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const { showOnboarding } = useAppStore();
  const { colors } = useTheme();

  return (
    <View 
      {...props} 
      style={[
        styles.tabListContainer,
        {
          backgroundColor: colors.bg.surface,
          borderTopColor: colors.border.default,
        },
        showOnboarding && ({ display: 'none' } as any)
      ] as any}
    >
      <View style={styles.innerContainer}>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  mobileFrame: {
    width: '100%',
    maxWidth: 430,
    height: '100%',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    borderTopWidth: 1,
    paddingBottom: Spacing.four,
    paddingTop: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(24px)',
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      }
    })
  },
  innerContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 430,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.one,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    gap: 4,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonLabel: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: Fonts.sans,
    letterSpacing: 0.5,
  },
  tabButtonLabelActive: {},
  activeHalo: {
    position: 'absolute',
    top: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    ...Platform.select({
      web: {
        filter: 'blur(4px)',
      }
    }),
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: -8,
  },
  pressed: {
    opacity: 0.7,
  },
});
