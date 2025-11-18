import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';

interface BudgetDisplayProps {
  budgetEstimate: number | null | undefined;
  totalCost: number;
  itemCount: number;
  showBudget: boolean;
  onToggleBudget: (value: boolean) => void;
}

export function BudgetDisplay({
  budgetEstimate,
  totalCost,
  itemCount,
  showBudget,
  onToggleBudget,
}: BudgetDisplayProps) {
  const hasBudget = budgetEstimate !== null && budgetEstimate !== undefined && budgetEstimate > 0;
  const variance = hasBudget ? totalCost - budgetEstimate : 0;
  const isOverBudget = variance > 0;

  return (
    <View style={styles.totalCard}>
      {hasBudget && showBudget && (
        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>Budget</Text>
          <Text style={styles.budgetAmount}>${budgetEstimate.toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.totalRow}>
        <View style={styles.totalLabelRow}>
          <Text style={styles.totalLabel}>Total</Text>
          {hasBudget && (
            <View style={styles.budgetToggleContainer}>
              <TouchableOpacity onPress={() => onToggleBudget(!showBudget)}>
                <Text style={styles.budgetToggleLabel}>Budget</Text>
              </TouchableOpacity>
              <Switch
                value={showBudget}
                onValueChange={onToggleBudget}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.border}
              />
            </View>
          )}
        </View>
        <Text style={styles.itemLabel}>Items</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalAmount}>${totalCost.toFixed(2)}</Text>
        <Text style={styles.itemCount}>{itemCount}</Text>
      </View>

      {hasBudget && showBudget && (
        <View style={styles.varianceRow}>
          <Text style={styles.varianceLabel}>Difference</Text>
          <Text style={[styles.varianceAmount, isOverBudget ? styles.overBudget : styles.underBudget]}>
            {isOverBudget ? '+' : ''}${Math.abs(variance).toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  totalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  budgetLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  budgetAmount: {
    ...typography.h3,
    color: colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  totalLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  budgetToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  budgetToggleLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  itemLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  itemCount: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
  },
  varianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  varianceLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  varianceAmount: {
    ...typography.h3,
    fontWeight: '600',
  },
  overBudget: {
    color: colors.error,
  },
  underBudget: {
    color: '#4CAF50', // Green color for under budget
  },
});
