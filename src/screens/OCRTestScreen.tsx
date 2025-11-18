import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from 'react-native-text-recognition';
import { OCRTextTransformer } from '../lib/ocr-text-transformer';
import { ShopItem } from '../types';

/**
 * OCR Test Screen
 * 
 * This screen allows you to manually test the OCR functionality:
 * 1. Pick an image from your device
 * 2. Extract text using OCR
 * 3. Transform the text to a ShopItem
 * 4. View the results and confidence score
 */
export default function OCRTestScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string>('');
  const [extractedItem, setExtractedItem] = useState<Partial<ShopItem> | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access media library is required!');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImagePickerAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setOcrText('');
        setExtractedItem(null);
        setConfidence(0);
        setError('');
      }
    } catch (err) {
      setError(`Error picking image: ${err}`);
    }
  };

  const processImage = async () => {
    if (!imageUri) {
      setError('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Step 1: Extract text using OCR
      const result = await TextRecognition.recognize(imageUri);
      const extractedText = Array.isArray(result) 
        ? result.join(' ').trim() 
        : String(result).trim();
      
      setOcrText(extractedText);

      // Step 2: Transform to ShopItem
      const item = OCRTextTransformer.transformToShopItem(extractedText);
      setExtractedItem(item);

      // Step 3: Calculate confidence
      const confidenceScore = OCRTextTransformer.getConfidenceScore(item);
      setConfidence(confidenceScore);

    } catch (err) {
      setError(`Error processing image: ${err}`);
      console.error('OCR Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return '#4CAF50'; // Green
    if (score >= 0.5) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OCR Test Screen</Text>
        <Text style={styles.subtitle}>
          Test image text extraction and ShopItem transformation
        </Text>
      </View>

      {/* Image Selection */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>📷 Pick Image</Text>
        </TouchableOpacity>

        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </View>
        )}
      </View>

      {/* Process Button */}
      {imageUri && (
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, styles.processButton]}
            onPress={processImage}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🔍 Extract & Transform</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={[styles.section, styles.errorSection]}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {/* OCR Text Result */}
      {ocrText && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extracted OCR Text:</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{ocrText}</Text>
          </View>
        </View>
      )}

      {/* Transformed Item Result */}
      {extractedItem && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transformed ShopItem:</Text>
          <View style={styles.resultBox}>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Name:</Text>
              <Text style={styles.itemValue}>{extractedItem.name || 'N/A'}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Brand:</Text>
              <Text style={styles.itemValue}>{extractedItem.brand || 'N/A'}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Price:</Text>
              <Text style={styles.itemValue}>
                ${extractedItem.price?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Weight:</Text>
              <Text style={styles.itemValue}>
                {extractedItem.weight || 0}
              </Text>
            </View>
          </View>

          {/* Confidence Score */}
          <View style={styles.confidenceContainer}>
            <Text style={styles.sectionTitle}>Confidence Score:</Text>
            <View
              style={[
                styles.confidenceBar,
                { backgroundColor: getConfidenceColor(confidence) },
              ]}
            >
              <Text style={styles.confidenceText}>
                {(confidence * 100).toFixed(0)}%
              </Text>
            </View>
            <Text style={styles.confidenceNote}>
              {confidence >= 0.8
                ? '✅ High confidence - Data looks accurate'
                : confidence >= 0.5
                ? '⚠️ Medium confidence - Review data carefully'
                : '❌ Low confidence - Manual verification needed'}
            </Text>
          </View>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.instructionsTitle}>How to use:</Text>
        <Text style={styles.instructions}>
          1. Tap "Pick Image" to select a photo with product information{'\n'}
          2. Tap "Extract & Transform" to process the image{'\n'}
          3. Review the extracted text and transformed ShopItem data{'\n'}
          4. Check the confidence score to assess accuracy{'\n'}
          {'\n'}
          Best results with:{'\n'}
          • Clear, well-lit images{'\n'}
          • Visible text on products/price tags{'\n'}
          • Minimal background clutter
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ea',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#6200ea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  processButton: {
    backgroundColor: '#00C853',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  errorSection: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  resultBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  itemValue: {
    fontSize: 14,
    color: '#333',
  },
  confidenceContainer: {
    marginTop: 16,
  },
  confidenceBar: {
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginVertical: 8,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  confidenceNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  instructions: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
