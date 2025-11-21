import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { Camera as CameraIcon } from 'phosphor-react-native';
import { runOnJS } from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';
import { detectRectangles, findBrightestRectangle, normalizeRectangle, type Rectangle } from '../lib/rectangle-detector';
import { RectangleOverlay } from './RectangleOverlay';

interface CameraCaptureVisionProps {
  onCapture: (imageUri: string) => void;
  disabled?: boolean;
}

export function CameraCaptureVision({ onCapture, disabled = false }: CameraCaptureVisionProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [detectedRectangle, setDetectedRectangle] = useState<Rectangle | null>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');

  const updateDetectedRectangle = useCallback((rect: Rectangle | null) => {
    setDetectedRectangle(rect);
  }, []);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    try {
      // Detect rectangles in the current frame
      const rectangles = detectRectangles(frame);
      
      // Find the most prominent rectangle (likely the price tag)
      const brightestRect = findBrightestRectangle(rectangles);
      
      // Normalize coordinates and update state
      if (brightestRect) {
        const normalized = normalizeRectangle(
          brightestRect,
          frame.width,
          frame.height
        );
        runOnJS(updateDetectedRectangle)(normalized);
      } else {
        runOnJS(updateDetectedRectangle)(null);
      }
    } catch (error) {
      console.error('Frame processor error:', error);
    }
  }, [updateDetectedRectangle]);

  const handleOpenCamera = async () => {
    if (disabled) return;

    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to scan price tags.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setShowCamera(true);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'balanced',
      });

      if (photo) {
        setShowCamera(false);
        // Convert file:// URI to be compatible with the rest of the app
        const uri = `file://${photo.path}`;
        onCapture(uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  if (!device) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleOpenCamera}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <CameraIcon size={24} color={colors.white} weight="bold" />
          <Text style={styles.primaryButtonText}>Scan Price Tag</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device={device}
            isActive={showCamera}
            photo={true}
            frameProcessor={frameProcessor}
          />

          {/* Rectangle overlay showing detected price tag */}
          <RectangleOverlay
            rectangle={detectedRectangle}
            frameWidth={width}
            frameHeight={height}
            color="#00FF00"
            lineWidth={3}
          />

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
                  {detectedRectangle
                    ? '✓ Price tag detected - tap to capture'
                    : 'Align the price tag within the frame'}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.captureButton,
                  detectedRectangle && styles.captureButtonActive,
                ]}
                onPress={handleTakePhoto}
                activeOpacity={0.8}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
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
    ...StyleSheet.absoluteFillObject,
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
  captureButtonActive: {
    borderColor: '#00FF00',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
  },
});
