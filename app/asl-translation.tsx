import { CameraCapture } from '@/components/camera-capture';
import { DetectionResultDisplay } from '@/components/detection-result';
import { Colors } from '@/constants/theme';
import {
  detectFingerspellingFromImage,
  DetectionResult,
  getFingerspellingSetupInstructions,
  isFingerspellingApiConfigured,
} from '@/services/fingerspellingDetection';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const HISTORY_KEY = 'asl_detection_history';
const MAX_HISTORY_ITEMS = 20;
const SAVE_CONFIDENCE_THRESHOLD = 0.6;

export default function ASLTranslationScreen() {
  const router = useRouter();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [currentResult, setCurrentResult] = useState<DetectionResult | null>(null);
  const [detectionHistory, setDetectionHistory] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const apiConfigured = isFingerspellingApiConfigured();
  const setupInstructions = getFingerspellingSetupInstructions();

  // Load detection history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        setDetectionHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const saveToHistory = async (letter: string) => {
    try {
      const newHistory = [letter, ...detectionHistory].slice(0, MAX_HISTORY_ITEMS);
      setDetectionHistory(newHistory);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const handleCameraCapture = async (imageUri: string) => {
    if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('file://')) {
      Alert.alert('Invalid image', 'Captured image could not be processed. Please try again.');
      return;
    }

    try {
      setIsProcessing(true);

      const result = await detectFingerspellingFromImage(imageUri);
      setCurrentResult(result);

      if (result.detectedLetter !== '?' && result.confidence >= SAVE_CONFIDENCE_THRESHOLD) {
        await saveToHistory(result.detectedLetter);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
      console.error('Detection error:', errorMessage);
      Alert.alert('Error', errorMessage);
      setCurrentResult({
        detectedLetter: '?',
        confidence: 0,
        error: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setCameraVisible(true);
  };

  const handleClearResult = () => {
    setCurrentResult(null);
  };

  const handleClearHistory = async () => {
    Alert.alert('Clear History', 'Are you sure you want to clear all detection history?', [
      {
        text: 'Cancel',
        onPress: () => {},
      },
      {
        text: 'Clear',
        onPress: async () => {
          try {
            setDetectionHistory([]);
            await AsyncStorage.removeItem(HISTORY_KEY);
          } catch (error) {
            console.error('Error clearing history:', error);
            Alert.alert('Error', 'Failed to clear history');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={Colors.light.tint} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ASL to English</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Main Content */}
        {isProcessing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.tint} />
            <Text style={styles.loadingText}>Analyzing fingerspelling...</Text>
          </View>
        ) : currentResult ? (
          <DetectionResultDisplay
            result={currentResult}
            onRetry={handleRetry}
            onClearResult={handleClearResult}
          />
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.instructionCard}>
              <Ionicons name="information-circle" size={32} color={Colors.light.tint} />
              <Text style={styles.instructionTitle}>How to Use</Text>
              <Text style={styles.instructionText}>
                1. Position your hand clearly in the camera frame{'\n'}
                2. Show one static fingerspelling letter clearly{'\n'}
                3. Tap the camera button to capture{'\n'}
                4. Your configured backend will analyze the image
              </Text>
              <Text style={styles.demoNotice}>
                Single-photo mode works best for static letters. Letters like J and Z require
                motion, so they should be handled in the future video flow instead.
              </Text>
            </View>

            {!apiConfigured && (
              <View style={styles.setupCard}>
                <Ionicons name="server-outline" size={28} color={Colors.light.tint} />
                <Text style={styles.setupTitle}>Backend Setup Required</Text>
                <Text style={styles.setupText}>{setupInstructions}</Text>
              </View>
            )}

            <View style={styles.buttonGrid}>
              <TouchableOpacity
                style={[styles.actionButton, !apiConfigured && styles.disabledButton]}
                onPress={() => setCameraVisible(true)}
                disabled={isProcessing || !apiConfigured}
              >
                <View style={styles.buttonIconContainer}>
                  <Ionicons name="camera" size={32} color={Colors.light.background} />
                </View>
                <Text style={styles.actionButtonText}>
                  {apiConfigured ? 'Take Picture' : 'Set API URL First'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, styles.disabledButton]}>
                <View style={styles.buttonIconContainer}>
                  <Ionicons name="videocam" size={32} color={Colors.light.background} />
                </View>
                <Text style={styles.actionButtonText}>Record Video</Text>
                <Text style={styles.comingSoonText}>(Coming Soon)</Text>
              </TouchableOpacity>
            </View>

            {/* Detection History */}
            {detectionHistory.length > 0 && (
              <View style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>Recent Detections</Text>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={styles.clearHistoryButton}>Clear</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.historyGrid}>
                  {detectionHistory.map((letter, index) => (
                    <View key={`${letter}-${index}`} style={styles.historyItem}>
                      <Text style={styles.historyLetter}>{letter}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.infoCard}>
              <Ionicons name="help-circle" size={24} color={Colors.light.tint} />
              <Text style={styles.infoText}>
                This prototype uses Expo Go for capture and a separate backend API for image
                inference. That lets you keep the current Expo workflow without switching to a
                custom development client.
              </Text>
            </View>
          </ScrollView>
        )}

        {/* Camera Capture Modal */}
        <CameraCapture
          visible={cameraVisible}
          onCapture={handleCameraCapture}
          onClose={() => setCameraVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray200,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  instructionCard: {
    backgroundColor: Colors.light.gray100,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 12,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.light.gray500,
    lineHeight: 20,
    textAlign: 'left',
  },
  demoNotice: {
    marginTop: 12,
    fontSize: 12,
    color: Colors.light.gray500,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  setupCard: {
    backgroundColor: '#F3FBF6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#CDE8D6',
  },
  setupTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  setupText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.gray500,
  },
  buttonGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.light.tint,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: Colors.light.background,
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  comingSoonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: Colors.light.gray100,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  clearHistoryButton: {
    color: Colors.light.tint,
    fontWeight: '600',
    fontSize: 12,
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyItem: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  historyLetter: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  infoCard: {
    backgroundColor: 'rgba(168, 213, 186, 0.1)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.gray500,
    lineHeight: 18,
  },
});
