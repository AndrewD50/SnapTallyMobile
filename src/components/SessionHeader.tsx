import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle, MapPin } from 'phosphor-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';
import { toast } from '../lib/toast';

interface SessionHeaderProps {
  shopName: string;
  location: string;
  startedAt: number;
  isActive: boolean;
  itemCount: number;
  debugMode: boolean;
  onBack: () => void;
  onFinish?: () => void;
  onToggleDebugMode?: (enabled: boolean) => void;
}

export function SessionHeader({
  shopName,
  location,
  startedAt,
  isActive,
  itemCount,
  debugMode,
  onBack,
  onFinish,
  onToggleDebugMode,
}: SessionHeaderProps) {
  const [debugModeTimer, setDebugModeTimer] = useState<NodeJS.Timeout | null>(null);
  const pressStartTime = useRef<number>(0);

  const handleFinishPressIn = () => {
    if (!onToggleDebugMode) return;
    
    pressStartTime.current = Date.now();
    const timer = setTimeout(() => {
      onToggleDebugMode(!debugMode);
      toast.success(!debugMode ? 'Debug mode ON' : 'Debug mode OFF');
      setDebugModeTimer(null);
    }, 20000);
    setDebugModeTimer(timer);
  };

  const handleFinishPressOut = () => {
    if (debugModeTimer) {
      clearTimeout(debugModeTimer);
      setDebugModeTimer(null);
    }
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={24} color={colors.text} weight="bold" />
        </TouchableOpacity>

        <View style={styles.centerHeaderSection}>
          <Text style={styles.headerShopName}>{shopName}</Text>
          <View style={styles.sessionInfoRow}>
            <MapPin size={12} color={colors.textSecondary} />
            <Text style={styles.sessionInfoText}>{location}</Text>
            <Text style={styles.sessionInfoSeparator}>•</Text>
            <Text style={styles.sessionInfoText}>{format(new Date(startedAt), 'MMM d, h:mm a')}</Text>
          </View>
          {debugMode && (
            <View style={styles.debugBadge}>
              <Text style={styles.debugBadgeText}>Debug Mode</Text>
            </View>
          )}
        </View>

        {isActive && onFinish && (
          <TouchableOpacity
            style={styles.finalizeButton}
            onPress={onFinish}
            onPressIn={handleFinishPressIn}
            onPressOut={handleFinishPressOut}
            disabled={itemCount === 0}
          >
            <CheckCircle size={20} color={colors.white} weight="bold" />
            <Text style={styles.finalizeButtonText}>Finish</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingTop: spacing.xxl + spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  backButton: {
    padding: spacing.xs,
    marginTop: -2,
  },
  centerHeaderSection: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: spacing.sm,
    flexDirection: 'column',
    gap: spacing.xs,
  },
  headerShopName: {
    ...typography.h3,
    color: colors.text,
  },
  debugBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  debugBadgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  finalizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: -2,
  },
  finalizeButtonText: {
    ...typography.small,
    color: colors.white,
    fontWeight: 'bold',
  },
  sessionInfo: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  sessionInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  sessionInfoText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  sessionInfoSeparator: {
    ...typography.small,
    color: colors.textSecondary,
  },
});
