import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera } from 'phosphor-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';

interface CameraCaptureProps {
  onCapture: (imageUri: string) => void;
  disabled?: boolean;
}

export function CameraCapture({ onCapture, disabled = false }: CameraCaptureProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const handleOpenCamera = async () => {
    if (disabled) return;

    if (!permission) {
      // Permission not loaded yet
      return;
    }

    if (!permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to scan price tags.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                // In production, you'd use Linking.openSettings()
                Alert.alert('Please enable camera in Settings');
              },
            },
          ]
        );
        return;
      }
    }

    setShowCamera(true);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
      });

      if (photo) {
        setShowCamera(false);
        onCapture(photo.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleOpenCamera}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Camera size={24} color={colors.white} weight="bold" />
          <Text style={styles.primaryButtonText}>Scan Price Tag</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowCamera(false)}
                >
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cameraFooter}>
                <View style={styles.hint}>
                  <Text style={styles.hintText}>
                    Align the price tag within the frame
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={handleTakePhoto}
                  activeOpacity={0.8}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
    </>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: 'transparent',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.full,
    minHeight: 56,
    ...shadows.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    ...typography.bodyBold,
    color: colors.white,
    marginLeft: spacing.sm,
    fontSize: 18,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  closeButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  closeButtonText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  cameraFooter: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hint: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  hintText: {
    ...typography.small,
    color: colors.white,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
  },
});
