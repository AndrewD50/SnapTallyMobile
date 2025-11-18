import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { MapPin, CalendarBlank } from 'phosphor-react-native';
import { ShoppingSession } from '../types';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';

interface SessionDetailModalProps {
  session: ShoppingSession | null;
  visible: boolean;
  onClose: () => void;
}

export function SessionDetailModal({ session, visible, onClose }: SessionDetailModalProps) {
  if (!session) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{session.shopName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <View style={styles.sessionDetailsMeta}>
              <View style={styles.metaItem}>
                <MapPin size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{session.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <CalendarBlank size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {format(new Date(session.startedAt), 'EEE, MMM d, yyyy h:mm a')}
                </Text>
              </View>
            </View>

            <View style={styles.sessionSummary}>
              {session.budgetEstimate !== null && session.budgetEstimate !== undefined && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Estimated Budget:</Text>
                  <Text style={styles.summaryValue}>${session.budgetEstimate.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Cost:</Text>
                <Text style={[styles.summaryValue, styles.summaryTotal]}>
                  ${(session.totalCost || 0).toFixed(2)}
                </Text>
              </View>
              {session.budgetVariance !== null && session.budgetVariance !== undefined && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Budget Variance:</Text>
                  <Text
                    style={[styles.summaryValue, session.isOverBudget && styles.overBudget]}
                  >
                    {session.budgetVariance >= 0 ? '+' : ''}${session.budgetVariance.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.itemsListTitle}>Items ({session.items.length})</Text>
            {session.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.brand && <Text style={styles.itemBrand}>{item.brand}</Text>}
                  <Text style={styles.itemDetails}>
                    {item.weight}g × {item.quantity}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
  },
  modalClose: {
    ...typography.h2,
    color: colors.textSecondary,
    paddingHorizontal: spacing.sm,
  },
  modalScroll: {
    padding: spacing.lg,
  },
  sessionDetailsMeta: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
  sessionSummary: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.bodyBold,
    color: colors.text,
  },
  summaryTotal: {
    ...typography.h3,
    color: colors.primary,
  },
  overBudget: {
    color: colors.error,
  },
  itemsListTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  itemBrand: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  itemDetails: {
    ...typography.small,
    color: colors.textSecondary,
  },
  itemPrice: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
