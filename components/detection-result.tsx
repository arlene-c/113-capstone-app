import { Colors } from '@/constants/theme';
import { DetectionResult, getConfidenceLevel } from '@/services/fingerspellingDetection';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DetectionResultDisplayProps = {
  result: DetectionResult | null;
  onRetry: () => void;
  onClearResult: () => void;
};

export const DetectionResultDisplay: React.FC<DetectionResultDisplayProps> = ({
  result,
  onRetry,
  onClearResult,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (result && result.letter !== '?') {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [result, scaleAnim]);

  if (!result) return null;

  const isError = result.letter === '?' || result.error;
  const confidenceLevel = getConfidenceLevel(result.confidence);
  const confidencePercent = (result.confidence * 100).toFixed(0);

  return (
    <View style={styles.container}>
      <View style={styles.resultCard}>
        {isError ? (
          <>
            <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Detection Failed</Text>
            <Text style={styles.errorMessage}>
              {result.error || 'Unable to detect fingerspelling. Please try again.'}
            </Text>
          </>
        ) : (
          <>
            <Animated.View
              style={[
                styles.letterDisplayContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Text style={styles.detectedLetter}>{result.letter}</Text>
            </Animated.View>

            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Confidence Level</Text>
              <View style={styles.confidenceBarContainer}>
                <View
                  style={[
                    styles.confidenceBar,
                    {
                      width: `${result.confidence * 100}%`,
                      backgroundColor: getConfidenceColor(result.confidence),
                    },
                  ]}
                />
              </View>
              <Text style={styles.confidenceText}>
                {confidenceLevel} ({confidencePercent}%)
              </Text>
            </View>

            <Text style={styles.letterName}>The letter is: {result.letter}</Text>
          </>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.retryButton]} onPress={onRetry}>
            <Ionicons name="camera" size={20} color={Colors.light.background} />
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={onClearResult}
          >
            <Ionicons name="trash" size={20} color={Colors.light.text} />
            <Text style={[styles.buttonText, { color: Colors.light.text }]}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return '#4ECDC4';
  if (confidence >= 0.75) return '#95E1D3';
  if (confidence >= 0.6) return '#F7DC6F';
  return '#FF6B6B';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  resultCard: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  letterDisplayContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  detectedLetter: {
    fontSize: 120,
    fontWeight: '900',
    color: Colors.light.tint,
    textAlignVertical: 'center',
  },
  confidenceContainer: {
    marginBottom: 24,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  confidenceBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceBar: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
  },
  letterName: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  retryButton: {
    backgroundColor: Colors.light.tint,
  },
  clearButton: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
    color: Colors.light.background,
  },
});
