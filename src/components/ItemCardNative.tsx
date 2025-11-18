import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Switch } from 'react-native';
import { ShoppingSessionItem } from '../types';
import { Trash, Minus, Plus, PencilSimple } from 'phosphor-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';

interface ItemCardNativeProps {
  item: ShoppingSessionItem;
  onUpdateQuantity: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onMarkIncorrect?: (id: string) => void;
  debugMode?: boolean;
  isNew?: boolean;
}

export function ItemCardNative({
  item,
  onUpdateQuantity,
  onDelete,
  onEdit,
  onMarkIncorrect,
  debugMode,
  isNew,
}: ItemCardNativeProps) {
  const isAnalyzing = false; // Add this to item type if needed
  const itemTotal = (item.price ?? 0) * (item.quantity ?? 1);

  return (
    <View style={[styles.card, isNew && styles.newCard]}>
      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          {item.priceTagImage && (
            <Image
              source={{ uri: item.priceTagImage }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          <View style={styles.details}>
            <View style={styles.header}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.price}>${itemTotal.toFixed(2)}</Text>
            </View>

            {item.brand && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.brand}</Text>
              </View>
            )}

            {item.weight > 0 && (
              <Text style={styles.weight}>{item.weight}g</Text>
            )}
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.bottomRow}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, item.quantity <= 1 && styles.buttonDisabled]}
              onPress={() => onUpdateQuantity(item.id, -1)}
              disabled={item.quantity <= 1}
            >
              <Minus size={16} color={item.quantity <= 1 ? colors.textTertiary : colors.text} />
            </TouchableOpacity>

            <Text style={styles.quantity}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(item.id, 1)}
            >
              <Plus size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            {debugMode && onMarkIncorrect && (
              <View style={styles.toggleContainer}>
                <TouchableOpacity onPress={() => onMarkIncorrect(item.id)}>
                  <Text style={styles.toggleLabel}>Incorrect</Text>
                </TouchableOpacity>
                <Switch
                  value={item.incorrectScan || false}
                  onValueChange={() => onMarkIncorrect(item.id)}
                  trackColor={{ false: colors.border, true: colors.error }}
                  thumbColor={colors.white}
                  ios_backgroundColor={colors.border}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onEdit(item.id)}
            >
              <PencilSimple size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onDelete(item.id)}
            >
              <Trash size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  newCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    ...shadows.md,
  },
  cardContent: {
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftColumn: {
    alignItems: 'center',
    marginRight: spacing.sm,
    width: 64,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  details: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  itemName: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  price: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  badgeText: {
    ...typography.tiny,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  weight: {
    ...typography.small,
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  quantity: {
    ...typography.body,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginRight: spacing.xs,
  },
  toggleLabel: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  iconButton: {
    padding: spacing.sm,
  },
});
