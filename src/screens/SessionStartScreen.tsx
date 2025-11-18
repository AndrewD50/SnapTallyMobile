import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ShoppingSession, ShopName } from '../types';
import { getAllSessions, startShoppingSession, deleteSession, getApprovedShopNames, submitShopName } from '../lib/api';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';
import { toast } from '../lib/toast';
import { format } from 'date-fns';
import * as Location from 'expo-location';
import { ShoppingCart, MapPin, Plus, Trash, ArrowRight } from 'phosphor-react-native';
import { Logo } from '../components/Logo';
import { SearchBar } from '../components/SearchBar';
import { SessionListItem } from '../components/SessionListItem';
import { SessionDetailModal } from '../components/SessionDetailModal';

type SessionStartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SessionStart'>;

interface Props {
  navigation: SessionStartScreenNavigationProp;
}

export default function SessionStartScreen({ navigation }: Props) {
  const [sessions, setSessions] = useState<ShoppingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [shopName, setShopName] = useState('');
  const [location, setLocation] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [approvedShopNames, setApprovedShopNames] = useState<ShopName[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customShopName, setCustomShopName] = useState('');
  const [shopType, setShopType] = useState('');
  const [budgetEstimate, setBudgetEstimate] = useState('');
  const [showShopTypeDropdown, setShowShopTypeDropdown] = useState(false);
  const [selectedCompletedSession, setSelectedCompletedSession] = useState<ShoppingSession | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'previous'>('active');

  useFocusEffect(
    React.useCallback(() => {
      loadSessions();
    }, [])
  );

  useEffect(() => {
    if (showNewForm) {
      if (!location) {
        getCurrentLocation();
      }
      loadApprovedShopNames();
    }
  }, [showNewForm]);

  const loadApprovedShopNames = async () => {
    try {
      const names = await getApprovedShopNames();
      setApprovedShopNames(names);
    } catch (error) {
      console.error('Failed to load shop names:', error);
      toast.error('Failed to load shop names');
    }
  };

  const loadSessions = async () => {
    try {
      const data = await getAllSessions();
      setSessions(data.sort((a, b) => b.startedAt - a.startedAt));
    } catch (error) {
      toast.error('Failed to load shopping sessions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };



  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Location permission denied');
        setGettingLocation(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`,
          {
            headers: {
              'User-Agent': 'SnapTallyMobile/1.0',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();

        const locationName =
          data.address?.suburb ||
          data.address?.city ||
          data.address?.town ||
          data.display_name?.split(',')[0] ||
          `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        setLocation(locationName);
      } catch (error) {
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        console.error('Reverse geocoding failed:', error);
      }
    } catch (error) {
      console.error('Location error:', error);
      toast.error('Could not get your location');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmitCustomShopName = async () => {
    if (!customShopName.trim()) {
      toast.error('Please enter a shop name');
      return;
    }

    try {
      await submitShopName({ name: customShopName.trim() });
      setShopName(customShopName.trim());
      setCustomShopName('');
      setShowCustomInput(false);
      toast.success('Shop name submitted for approval and selected');
    } catch (error) {
      console.error('Failed to submit shop name:', error);
      toast.error('Failed to submit shop name');
    }
  };

  const handleStartSession = async () => {
    if (!shopName.trim()) {
      toast.error('Please select a shop name');
      return;
    }

    setCreating(true);
    try {
      const session = await startShoppingSession({
        shopName: shopName.trim(),
        location: location.trim() || 'Unknown',
        date: new Date().toISOString(),
        shopType: shopType || undefined,
        budgetEstimate: budgetEstimate ? parseFloat(budgetEstimate) : undefined,
      });

      toast.success(`Started shopping at ${session.shopName}`);
      setShopName('');
      setLocation('');
      setShopType('');
      setBudgetEstimate('');
      setShowNewForm(false);
      setShowCustomInput(false);
      navigation.navigate('Shopping', { sessionId: session.id });
    } catch (error) {
      toast.error('Failed to start shopping session');
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleResumeSession = (sessionId: string) => {
    navigation.navigate('Shopping', { sessionId });
  };

  const handleDeleteSession = (session: ShoppingSession) => {
    const formattedDate = format(new Date(session.date), 'PPp');
    
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete ${session.shopName} shopping session on ${formattedDate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSession(session.id);
              setSessions(sessions.filter((s) => s.id !== session.id));
              toast.success(`Deleted ${session.shopName}`);
            } catch (error) {
              toast.error('Failed to delete session');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const activeSessions = sessions.filter((s) => s.status === 'active');
  const completedSessions = sessions.filter((s) => s.status === 'finalized');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Logo width={240} height={51} />
        </View>

        {!showNewForm && (
          <>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => setShowNewForm(true)}
              activeOpacity={0.7}
            >
              <Plus size={24} color={colors.white} weight="bold" />
              <Text style={styles.startButtonText}>Start New Shopping Trip</Text>
            </TouchableOpacity>

          </>
        )}

        {!showNewForm && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'active' && styles.tabActive]}
              onPress={() => setActiveTab('active')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
                Active ({activeSessions.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'previous' && styles.tabActive]}
              onPress={() => setActiveTab('previous')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'previous' && styles.tabTextActive]}>
                Previous ({completedSessions.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {showNewForm && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Start New Shopping Trip</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shop Name *</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowDropdown(true)}
                activeOpacity={0.7}
              >
                <ShoppingCart size={20} color={colors.textSecondary} />
                <Text style={[styles.input, !shopName && styles.placeholder]}>
                  {shopName || 'Select shop name'}
                </Text>
              </TouchableOpacity>
              {shopName && (
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={() => setShowDropdown(true)}
                >
                  <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Your location"
                  value={location}
                  onChangeText={setLocation}
                  editable={!gettingLocation}
                />
                {gettingLocation && (
                  <ActivityIndicator size="small" color={colors.primary} />
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shop Coverage</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowShopTypeDropdown(true)}
                activeOpacity={0.7}
              >
                <ShoppingCart size={20} color={colors.textSecondary} />
                <Text style={[styles.input, !shopType && styles.placeholder]}>
                  {shopType === 'FullShop' ? 'Full shop' : shopType === 'TopUpShop' ? 'Top up shop' : 'Select shop type (optional)'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estimated Budget</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={budgetEstimate}
                  onChangeText={setBudgetEstimate}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => {
                  setShowNewForm(false);
                  setShopName('');
                  setLocation('');
                }}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleStartSession}
                disabled={creating || !shopName.trim()}
              >
                {creating ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.buttonPrimaryText}>Start Shopping</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Shop Name Dropdown Modal */}
        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDropdown(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Shop Name</Text>
                <TouchableOpacity onPress={() => setShowDropdown(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={approvedShopNames}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setShopName(item.name);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No approved shop names available</Text>
                }
              />
              
              <TouchableOpacity
                style={styles.addCustomButton}
                onPress={() => {
                  setShowDropdown(false);
                  setShowCustomInput(true);
                }}
              >
                <Plus size={20} color={colors.primary} weight="bold" />
                <Text style={styles.addCustomButtonText}>Add Custom Shop Name</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Custom Shop Name Modal */}
        <Modal
          visible={showCustomInput}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCustomInput(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Custom Shop Name</Text>
                <TouchableOpacity onPress={() => setShowCustomInput(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalDescription}>
                This shop name will be submitted for approval and can be used immediately.
              </Text>
              
              <View style={styles.inputContainer}>
                <ShoppingCart size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter shop name"
                  value={customShopName}
                  onChangeText={setCustomShopName}
                  autoCapitalize="words"
                  autoFocus
                />
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => {
                    setShowCustomInput(false);
                    setCustomShopName('');
                  }}
                >
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={handleSubmitCustomShopName}
                  disabled={!customShopName.trim()}
                >
                  <Text style={styles.buttonPrimaryText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Shop Type Dropdown Modal */}
        <Modal
          visible={showShopTypeDropdown}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowShopTypeDropdown(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Shop Type</Text>
                <TouchableOpacity onPress={() => setShowShopTypeDropdown(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setShopType('');
                  setShowShopTypeDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>None</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setShopType('FullShop');
                  setShowShopTypeDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>Full shop</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setShopType('TopUpShop');
                  setShowShopTypeDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>Top up shop</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {!showNewForm && activeTab === 'active' && activeSessions.length > 0 && (
          <View style={styles.section}>
            {activeSessions.map((session) => (
              <SessionListItem
                key={session.id}
                session={session}
                isActive={true}
                onPress={() => handleResumeSession(session.id)}
                onDelete={() => handleDeleteSession(session)}
              />
            ))}
          </View>
        )}

        {!showNewForm && activeTab === 'active' && activeSessions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No active sessions</Text>
          </View>
        )}

        {!showNewForm && activeTab === 'previous' && completedSessions.length > 0 && (
          <View style={styles.section}>
            {completedSessions.map((session) => (
              <SessionListItem
                key={session.id}
                session={session}
                isActive={false}
                onPress={() => setSelectedCompletedSession(session)}
                onDelete={() => handleDeleteSession(session)}
              />
            ))}
          </View>
        )}

        {!showNewForm && activeTab === 'previous' && completedSessions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No previous sessions</Text>
          </View>
        )}
      </ScrollView>

      {/* Completed Session Details Modal */}
      <SessionDetailModal
        session={selectedCompletedSession}
        visible={selectedCompletedSession !== null}
        onClose={() => setSelectedCompletedSession(null)}
      />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'flex-start',
    marginVertical: spacing.xl,
  },
  searchSection: {
    marginBottom: spacing.xs,
  },
  searchSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  searchSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  searchSectionTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  searchSectionContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  toggleSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  toggleSearchText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  startButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    alignSelf: 'stretch',
  },
  startButtonText: {
    ...typography.bodyBold,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: 0,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#E6C745',
    ...shadows.md,
  },
  tabText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 15,
  },
  tabTextActive: {
    color: colors.white,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.small,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body,
    color: colors.text,
  },
  currencySymbol: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPrimaryText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  buttonSecondaryText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  section: {
    marginTop: 0,
  },
  sectionTitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeSessionCard: {
    borderColor: '#6CB049',
    borderWidth: 2,
  },
  completedCard: {
    opacity: 0.9,
  },
  sessionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  activeBadge: {
    backgroundColor: '#6CB049',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  activeBadgeText: {
    ...typography.tiny,
    color: colors.white,
    fontWeight: '600',
  },
  sessionContent: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sessionName: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  activeSessionName: {
    color: '#6CB049',
  },
  sessionTotal: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'right',
  },
  sessionMeta: {
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  metaText: {
    ...typography.small,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionItems: {
    ...typography.small,
    color: colors.textSecondary,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  deleteButton: {
    padding: spacing.sm,
    justifyContent: 'center',
  },
  placeholder: {
    color: colors.textSecondary,
  },
  changeButton: {
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  changeButtonText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.md,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  modalClose: {
    ...typography.h2,
    color: colors.textSecondary,
    paddingHorizontal: spacing.sm,
  },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  dropdownItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    ...typography.body,
    color: colors.text,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addCustomButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  budgetVariance: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  overBudget: {
    color: colors.error,
  },
  modalScroll: {
    maxHeight: '100%',
  },
  sessionDetailsMeta: {
    marginBottom: spacing.md,
  },
  sessionSummary: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
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
  itemsListTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.md,
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
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
