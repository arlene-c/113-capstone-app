import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type CameraCaptureProps = {
  visible: boolean;
  onCapture: (imageUri: string) => void;
  onClose: () => void;
};

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  visible,
  onCapture,
  onClose,
}) => {
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  React.useEffect(() => {
    if (!visible) {
      setCameraPermission(null);
      return;
    }

    let isMounted = true;
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (isMounted) {
        setCameraPermission(status === 'granted');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [visible]);

  const handleCapture = async () => {
    if (!cameraRef.current || !cameraPermission) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo && photo.uri) {
        onCapture(photo.uri);
        onClose();
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  if (!visible) return null;

  if (cameraPermission === null) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </Modal>
    );
  }

  if (!cameraPermission) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.errorText}>Camera permission required to capture fingerspelling</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        />

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={isCapturing}
          >
            <Ionicons name="close" size={24} color={Colors.light.background} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator size="small" color={Colors.light.background} />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>

          <View style={styles.spacer} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: Colors.light.text,
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: Colors.light.background,
  },
  spacer: {
    width: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
  },
});