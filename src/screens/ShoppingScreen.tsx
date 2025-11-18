import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ShoppingSession, ShoppingSessionItem } from '../types';
import {
  getSession,
  addItemToSession,
  updateSessionItem,
  deleteSessionItem,
  finalizeSession,
  analyzePriceTag,
  updateSession,
} from '../lib/api';
import { CameraCapture } from '../components/CameraCaptureNative';
import { ItemCardNative } from '../components/ItemCardNative';
import { EditItemDialogNative } from '../components/EditItemDialogNative';
import { SessionHeader } from '../components/SessionHeader';
import { BudgetDisplay } from '../components/BudgetDisplay';
import { FinalizeModal } from '../components/FinalizeModal';
import { colors, spacing, typography, shadows, borderRadius } from '../styles/theme';
import { toast } from '../lib/toast';
import { compressImage } from '../lib/image-compression-native';

type ShoppingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Shopping'>;
type ShoppingScreenRouteProp = RouteProp<RootStackParamList, 'Shopping'>;

interface Props {
  navigation: ShoppingScreenNavigationProp;
  route: ShoppingScreenRouteProp;
}

export default function ShoppingScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const [session, setSession] = useState<ShoppingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingSessionItem | null>(null);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [lastScannedItemId, setLastScannedItemId] = useState<string | null>(null);
  const [showBudget, setShowBudget] = useState(false);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const data = await getSession(sessionId);
      setSession(data);
      setShowBudget(data.displayBudget || false);
    } catch (error) {
      toast.error('Failed to load session');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetToggle = async (value: boolean) => {
    setShowBudget(value);
    try {
      await updateSession(sessionId, { displayBudget: value });
    } catch (error) {
      console.error('Failed to update budget display setting:', error);
      // Revert on error
      setShowBudget(!value);
    }
  };

  const handleCapture = async (imageUri: string) => {
    if (!session || session.status !== 'active') {
      toast.error('Cannot add items to a finalized session');
      return;
    }

    setAnalyzing(true);

    try {
      // Compress the image
      const compressed = await compressImage(imageUri);

      // Analyze the price tag - pass base64 if available
      const result = await analyzePriceTag(compressed.uri, compressed.base64);

      // Add item to session
      const newItem = await addItemToSession(sessionId, {
        name: result.name || 'Unknown Item',
        brand: result.brand || '',
        price: result.price || 0,
        weight: result.weight || 0,
        quantity: 1,
        priceTagImage: compressed.uri,
        incorrectScan: false,
      });

      setLastScannedItemId(newItem.id);
      // Reload session to get updated data
      await loadSession();
      toast.success('Item added successfully');
    } catch (error) {
      console.error('Failed to analyze price tag:', error);
      toast.error('Failed to analyze price tag');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, delta: number) => {
    if (!session) return;

    const item = session.items.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    try {
      await updateSessionItem(sessionId, itemId, {
        ...item,
        quantity: newQuantity,
      });
      await loadSession();
    } catch (error) {
      toast.error('Failed to update item');
      console.error(error);
    }
  };

  const handleEditItem = (itemId: string) => {
    if (!session) return;
    const item = session.items.find((i) => i.id === itemId);
    if (item) {
      setEditingItem(item);
    }
  };

  const handleSaveEdit = async (itemId: string, updates: Partial<ShoppingSessionItem>) => {
    if (!session) return;

    const item = session.items.find((i) => i.id === itemId);
    if (!item) return;

    try {
      await updateSessionItem(sessionId, itemId, {
        ...item,
        ...updates,
        incorrectScan: true, // Mark as incorrect scan when manually edited
      });
      await loadSession();
      toast.success('Item updated');
    } catch (error) {
      toast.error('Failed to update item');
      console.error(error);
      throw error;
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!session) return;

    const item = session.items.find((i) => i.id === itemId);
    if (!item) return;

    Alert.alert('Delete Item', `Remove ${item.name} from cart?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSessionItem(sessionId, itemId);
            await loadSession();
            toast.success('Item removed');
          } catch (error) {
            toast.error('Failed to delete item');
            console.error(error);
          }
        },
      },
    ]);
  };

  const handleMarkAsIncorrectScan = async (itemId: string) => {
    if (!session) return;

    const item = session.items.find((i) => i.id === itemId);
    if (!item) {
      toast.error('Item not found');
      return;
    }

    // Toggle the incorrectScan status
    const newIncorrectScan = !item.incorrectScan;
    
    console.log('Toggling incorrectScan:', {
      itemId,
      currentValue: item.incorrectScan,
      newValue: newIncorrectScan,
    });
    
    // Optimistically update the UI
    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(i => 
          i.id === itemId 
            ? { ...i, incorrectScan: newIncorrectScan }
            : i
        )
      };
    });

    try {
      const updatePayload = {
        name: item.name,
        brand: item.brand,
        price: item.price,
        weight: item.weight,
        quantity: item.quantity,
        priceTagImage: item.priceTagImage,
        incorrectScan: newIncorrectScan,
      };
      
      console.log('Update payload:', JSON.stringify(updatePayload));
      
      const result = await updateSessionItem(sessionId, itemId, updatePayload);
      console.log('Update result:', result);
      
      if (lastScannedItemId === itemId) {
        setLastScannedItemId(null);
      }
      
      // Reload to confirm server state
      await loadSession();
      toast.success(newIncorrectScan ? 'Marked as incorrect scan' : 'Unmarked as incorrect');
    } catch (error) {
      // Revert on error
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map(i => 
            i.id === itemId 
              ? { ...i, incorrectScan: item.incorrectScan }
              : i
          )
        };
      });
      toast.error('Failed to update item');
      console.error('Error updating item:', error);
    }
  };

  const handleFinalizeSession = () => {
    if (!session) return;
    setShowFinalizeModal(true);
  };

  const handleConfirmFinalize = async (rating: number, comments: string) => {
    if (!session) return;

    try {
      await finalizeSession(sessionId, {
        satisfactionRating: rating > 0 ? rating : undefined,
        comments: comments.trim() || undefined,
      });
      toast.success('Shopping trip completed!');
      setShowFinalizeModal(false);
      navigation.goBack();
    } catch (error) {
      toast.error('Failed to finalize session');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  const isActive = session.status === 'active';
  const totalItemCount = session.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <SessionHeader
        shopName={session.shopName}
        location={session.location}
        startedAt={session.startedAt}
        isActive={isActive}
        itemCount={totalItemCount}
        debugMode={debugMode}
        onBack={() => navigation.goBack()}
        onFinish={handleFinalizeSession}
        onToggleDebugMode={() => setDebugMode(prev => !prev)}
      />

      <BudgetDisplay
        budgetEstimate={session.budgetEstimate || 0}
        totalCost={session.totalCost || 0}
        itemCount={totalItemCount}
        showBudget={showBudget}
        onToggleBudget={handleBudgetToggle}
      />

      {/* Items List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {analyzing && (
          <View style={styles.analyzingCard}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.analyzingText}>Analyzing price tag...</Text>
          </View>
        )}

        {session.items.length === 0 && !analyzing ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No items yet</Text>
            <Text style={styles.emptyMessage}>
              Start scanning price tags to add items to your cart
            </Text>
          </View>
        ) : (
          session.items.map((item, index) => (
            <ItemCardNative
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onDelete={handleDeleteItem}
              onEdit={handleEditItem}
              onMarkIncorrect={handleMarkAsIncorrectScan}
              debugMode={debugMode}
            />
          ))
        )}

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Edit Item Dialog */}
      <EditItemDialogNative
        visible={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />

      <FinalizeModal
        visible={showFinalizeModal}
        itemCount={totalItemCount}
        totalCost={session?.totalCost || 0}
        onFinalize={handleConfirmFinalize}
        onCancel={() => setShowFinalizeModal(false)}
      />

      {/* Camera Capture */}
      {isActive && <CameraCapture onCapture={handleCapture} disabled={analyzing} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.sm,
  },
  analyzingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  analyzingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
