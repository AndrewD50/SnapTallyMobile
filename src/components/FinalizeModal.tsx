import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Star } from 'phosphor-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';

interface FinalizeModalProps {
  visible: boolean;
  itemCount: number;
  totalCost: number;
  onFinalize: (rating: number, comments: string) => void;
  onCancel: () => void;
}

export function FinalizeModal({ visible, itemCount, totalCost, onFinalize, onCancel }: FinalizeModalProps) {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');

  const handleFinalize = () => {
    onFinalize(rating, comments);
    // Reset for next time
    setRating(0);
    setComments('');
  };

  const handleCancel = () => {
    onCancel();
    // Reset
    setRating(0);
    setComments('');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={handleCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.finalizeModal}>
          <Text style={styles.finalizeTitle}>Finish shopping trip?</Text>
          <Text style={styles.finalizeSubtitle}>
            This will finalize your shopping session with {itemCount} items totaling ${totalCost.toFixed(2)}. You
            won't be able to add more items after this.
          </Text>

          <Text style={styles.ratingLabel}>How was your shopping experience?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
                <Star
                  size={40}
                  weight={rating >= star ? 'fill' : 'regular'}
                  color={rating >= star ? '#FFD700' : '#D1D5DB'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.commentsLabel}>Comments (optional)</Text>
          <TextInput
            style={styles.commentsInput}
            placeholder="Add any notes about your shopping trip..."
            placeholderTextColor={colors.textSecondary}
            value={comments}
            onChangeText={setComments}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{comments.length}/1000</Text>

          <TouchableOpacity style={styles.finishButton} onPress={handleFinalize}>
            <Text style={styles.finishButtonText}>Finish Shopping</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  finalizeModal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 500,
    ...shadows.lg,
  },
  finalizeTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  finalizeSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  ratingLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  starButton: {
    padding: spacing.xs,
  },
  commentsLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  commentsInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 100,
    ...typography.body,
    color: colors.text,
  },
  characterCount: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  finishButton: {
    backgroundColor: '#4CAF50',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  finishButtonText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
});
