import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import TextRecognition from 'react-native-text-recognition';
import { compressImage } from '../lib/image-compression-native';
import { analyzePriceTagFromText } from '../lib/api';
import { colors } from '../styles/theme';

interface ProcessedImage {
  uri: string;
  filename: string;
  ocrText: string;
  extractedName: string;
  extractedBrand: string;
  extractedPrice: number;
  extractedWeight: number;
  confidence?: number;
  processingTime: number;
  error?: string;
  base64?: string;
}

/**
 * Batch OCR Test Screen
 * 
 * Process thousands of price tag images in batch and export results
 * Perfect for large-scale testing and accuracy validation
 */
export default function BatchOCRTestScreen() {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProcessedImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  /**
   * Select multiple images and process them
   */
  const selectAndProcessImages = async () => {
    try {
      // Check if TextRecognition is available
      if (!TextRecognition || !TextRecognition.recognize) {
        Alert.alert(
          'OCR Not Available',
          'Local text recognition is not available. This feature requires a development build with react-native-text-recognition.\n\nNote: This feature does not work in Expo Go. You need to create a development build or use the API-based OCR instead.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Media library permission is required.');
        return;
      }

      // Select multiple images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const images = result.assets;
      setTotalImages(images.length);
      setCurrentIndex(0);
      setResults([]);
      setProcessing(true);
      setStartTime(Date.now());

      const processedResults: ProcessedImage[] = [];

      // Process each image
      for (let i = 0; i < images.length; i++) {
        setCurrentIndex(i + 1);
        const image = images[i];
        
        try {
          const imageStartTime = Date.now();
          
          // Step 1: Compress image and get base64
          const compressed = await compressImage(image.uri);
          
          // Step 2: Extract text using local OCR
          if (!TextRecognition || !TextRecognition.recognize) {
            throw new Error('TextRecognition module is not available. Make sure react-native-text-recognition is properly installed.');
          }
          
          const ocrResult = await TextRecognition.recognize(compressed.uri);
          const ocrText = Array.isArray(ocrResult) 
            ? ocrResult.join(' ').trim() 
            : String(ocrResult).trim();

          // Step 3: Send OCR text to API for parsing
          const apiResult = await analyzePriceTagFromText(ocrText);

          const processingTime = Date.now() - imageStartTime;

          processedResults.push({
            uri: image.uri,
            filename: image.fileName || `image_${i + 1}.jpg`,
            ocrText,
            extractedName: apiResult.name || '',
            extractedBrand: apiResult.brand || '',
            extractedPrice: apiResult.price || 0,
            extractedWeight: apiResult.weight || 0,
            processingTime,
            base64: compressed.base64,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error processing image ${i + 1}:`, errorMessage);
          
          processedResults.push({
            uri: image.uri,
            filename: image.fileName || `image_${i + 1}.jpg`,
            ocrText: '',
            extractedName: '',
            extractedBrand: '',
            extractedPrice: 0,
            extractedWeight: 0,
            processingTime: 0,
            error: errorMessage,
          });
        }

        // Update results incrementally
        setResults([...processedResults]);
      }

      setProcessing(false);
      
      const totalTime = Date.now() - startTime;
      Alert.alert(
        'Processing Complete',
        `Processed ${images.length} images in ${(totalTime / 1000).toFixed(1)}s\n` +
        `Average: ${(totalTime / images.length).toFixed(0)}ms per image`,
        [
          { text: 'OK' },
          { text: 'Export Results', onPress: () => exportResults(processedResults) }
        ]
      );
    } catch (error) {
      console.error('Batch processing error:', error);
      Alert.alert('Error', 'Failed to process images');
      setProcessing(false);
    }
  };

  /**
   * Export results to CSV file
   */
  const exportResults = async (data: ProcessedImage[]) => {
    try {
      // Create CSV content
      const headers = [
        'Filename',
        'OCR Text',
        'Extracted Name',
        'Extracted Brand',
        'Extracted Price',
        'Extracted Weight',
        'Confidence',
        'Processing Time (ms)',
        'Error',
        'Base64 Image'
      ];

      const csvRows = [
        headers.join(','),
        ...data.map(item => [
          escapeCSV(item.filename),
          escapeCSV(item.ocrText),
          escapeCSV(item.extractedName),
          escapeCSV(item.extractedBrand),
          item.extractedPrice,
          item.extractedWeight,
          ((item.confidence || 0) * 100).toFixed(1),
          item.processingTime,
          escapeCSV(item.error || ''),
          escapeCSV(item.base64 || '')
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');

      // Save to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `ocr_batch_results_${timestamp}.csv`;
      const file = new File(Paths.document, filename);
      await file.write(csvContent);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export OCR Batch Results',
        });
      } else {
        Alert.alert('Export Complete', `Results saved to: ${file.uri}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export results');
    }
  };

  /**
   * Export results to JSON file (alternative format)
   */
  const exportResultsJSON = async (data: ProcessedImage[]) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `ocr_batch_results_${timestamp}.json`;
      const file = new File(Paths.document, filename);

      const jsonContent = JSON.stringify({
        exportDate: new Date().toISOString(),
        totalImages: data.length,
        successCount: data.filter(r => !r.error).length,
        errorCount: data.filter(r => r.error).length,
        averageConfidence: data.reduce((sum, r) => sum + (r.confidence || 0), 0) / data.length,
        results: data,
      }, null, 2);

      await file.write(jsonContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Export OCR Batch Results (JSON)',
        });
      } else {
        Alert.alert('Export Complete', `Results saved to: ${file.uri}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export results');
    }
  };

  /**
   * Escape CSV special characters
   */
  const escapeCSV = (value: string): string => {
    if (!value) return '';
    const needsQuotes = /[",\n\r]/.test(value);
    const escaped = value.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  /**
   * Get statistics from results
   */
  const getStats = () => {
    if (results.length === 0) return null;

    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);
    const avgConfidence = successful.reduce((sum, r) => sum + (r.confidence || 0), 0) / successful.length;
    const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length;
    
    const highConfidence = successful.filter(r => (r.confidence || 0) >= 0.8).length;
    const mediumConfidence = successful.filter(r => (r.confidence || 0) >= 0.5 && (r.confidence || 0) < 0.8).length;
    const lowConfidence = successful.filter(r => (r.confidence || 0) < 0.5).length;

    return {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      avgConfidence: (avgConfidence * 100).toFixed(1),
      avgProcessingTime: avgProcessingTime.toFixed(0),
      highConfidence,
      mediumConfidence,
      lowConfidence,
    };
  };

  const stats = getStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Batch OCR Processing</Text>
        <Text style={styles.subtitle}>Process thousands of images for testing</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, processing && styles.buttonDisabled]}
          onPress={selectAndProcessImages}
          disabled={processing}
        >
          <Text style={styles.buttonText}>
            {processing ? 'Processing...' : '📁 Select & Process Images'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Processing Progress */}
      {processing && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Processing {currentIndex} of {totalImages}...
          </Text>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.progressSubtext}>
            {totalImages > 0 ? `${((currentIndex / totalImages) * 100).toFixed(0)}% complete` : ''}
          </Text>
        </View>
      )}

      {/* Statistics */}
      {stats && !processing && (
        <ScrollView style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Results Summary</Text>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Images</Text>
            <Text style={styles.statValue}>{stats.total}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Successful</Text>
            <Text style={[styles.statValue, styles.successText]}>{stats.successful}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Failed</Text>
            <Text style={[styles.statValue, styles.errorText]}>{stats.failed}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Average Confidence</Text>
            <Text style={styles.statValue}>{stats.avgConfidence}%</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg Processing Time</Text>
            <Text style={styles.statValue}>{stats.avgProcessingTime}ms</Text>
          </View>

          <View style={styles.confidenceBreakdown}>
            <Text style={styles.breakdownTitle}>Confidence Distribution:</Text>
            <View style={styles.breakdownRow}>
              <View style={[styles.badge, styles.highBadge]}>
                <Text style={styles.badgeText}>High (≥80%)</Text>
              </View>
              <Text style={styles.breakdownValue}>{stats.highConfidence}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <View style={[styles.badge, styles.mediumBadge]}>
                <Text style={styles.badgeText}>Medium (50-79%)</Text>
              </View>
              <Text style={styles.breakdownValue}>{stats.mediumConfidence}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <View style={[styles.badge, styles.lowBadge]}>
                <Text style={styles.badgeText}>Low (&lt;50%)</Text>
              </View>
              <Text style={styles.breakdownValue}>{stats.lowConfidence}</Text>
            </View>
          </View>

          {/* Export Buttons */}
          <View style={styles.exportContainer}>
            <TouchableOpacity
              style={[styles.button, styles.exportButton]}
              onPress={() => exportResults(results)}
            >
              <Text style={styles.buttonText}>📊 Export as CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.exportButton]}
              onPress={() => exportResultsJSON(results)}
            >
              <Text style={styles.buttonText}>📄 Export as JSON</Text>
            </TouchableOpacity>
          </View>

          {/* Sample Results */}
          <Text style={styles.sampleTitle}>Sample Results (First 10)</Text>
          {results.slice(0, 10).map((result, index) => (
            <View key={index} style={styles.resultCard}>
              <Text style={styles.resultFilename}>{result.filename}</Text>
              {result.error ? (
                <Text style={styles.errorText}>Error: {result.error}</Text>
              ) : (
                <>
                  <Text style={styles.resultText}>Name: {result.extractedName}</Text>
                  <Text style={styles.resultText}>Price: ${result.extractedPrice.toFixed(2)}</Text>
                  <Text style={styles.resultText}>
                    Confidence: {((result.confidence || 0) * 100).toFixed(0)}%
                  </Text>
                </>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Instructions */}
      {!processing && results.length === 0 && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to Use:</Text>
          <Text style={styles.instructionsText}>
            1. Tap "Select & Process Images"{'\n'}
            2. Choose multiple images from your gallery{'\n'}
            3. Wait for processing to complete{'\n'}
            4. Review statistics and results{'\n'}
            5. Export results as CSV or JSON for analysis{'\n\n'}
            💡 Tip: You can select hundreds or thousands of images at once!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  buttonContainer: {
    padding: 15,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  exportButton: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 15,
    borderRadius: 8,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  progressSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  statsContainer: {
    flex: 1,
    padding: 15,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#F44336',
  },
  confidenceBreakdown: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1976D2',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flex: 1,
    marginRight: 10,
  },
  highBadge: {
    backgroundColor: '#4CAF50',
  },
  mediumBadge: {
    backgroundColor: '#FF9800',
  },
  lowBadge: {
    backgroundColor: '#F44336',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  exportContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  sampleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  resultCard: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  resultFilename: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  resultText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  instructionsContainer: {
    margin: 15,
    padding: 20,
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FBC02D',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#F57F17',
  },
  instructionsText: {
    fontSize: 14,
    color: '#F57F17',
    lineHeight: 22,
  },
});
