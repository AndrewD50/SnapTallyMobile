import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { MapPin, CalendarBlank, Trash } from 'phosphor-react-native';
import { ShoppingSession } from '../types';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';

interface SessionListItemProps {
  session: ShoppingSession;
  onPress: () => void;
  onDelete: () => void;
  isActive?: boolean;
}

export function SessionListItem({ session, onPress, onDelete, isActive = false }: SessionListItemProps) {
  return (
    <TouchableOpacity
      style={[styles.sessionCard, isActive && styles.activeSessionCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.sessionContent}>
        <View style={styles.sessionHeader}>
          <Text style={[styles.sessionName, isActive && styles.activeSessionName]}>
            {session.shopName}
          </Text>
        </View>

        <View style={styles.sessionMeta}>
          <View style={styles.metaItem}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{session.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <CalendarBlank size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {format(new Date(session.startedAt), isActive ? 'MMM d, h:mm a' : 'MMM d, yyyy h:mm a')}
            </Text>
          </View>
        </View>

        <Text style={styles.sessionItems}>
          {session.items.length} {session.items.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      <View style={styles.rightColumn}>
        <Text style={styles.sessionTotal}>${(session.totalCost || 0).toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sessionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  activeSessionCard: {
    // Removed special border styling
  },
  sessionContent: {
    flex: 1,
    gap: spacing.xs,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sessionName: {
    ...typography.h3,
    color: colors.text,
  },
  activeSessionName: {
    // Removed special color styling
  },
  sessionMeta: {
    gap: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  sessionItems: {
    ...typography.small,
    color: colors.textSecondary,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  sessionTotal: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
  },
  deleteButton: {
    padding: spacing.xs,
  },
});
