import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useTheme } from "../contexts/ThemeContext";

export default function Create() {
  console.log("create page has been reached"); // debugging log
  const { theme } = useTheme();

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    console.log("Create component mounted");
  }, []);

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      >
        <Text style={[styles.message, { color: theme.textColor }]}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={[styles.button, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    console.log("Taking picture...");
    try {
      if (cameraRef.current) {
        console.log("Camera ref is available");
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        console.log("Photo taken:", photo.uri);
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to take picture");
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const uploadImage = async () => {
    if (!capturedImage) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: capturedImage,
        type: "image/jpeg",
        name: "outfit.jpg",
      } as any);

      const response = await fetch("http://your-server-url.com/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.ok) {
        console.log("Image uploaded successfully");
        Alert.alert("Success", "Image uploaded successfully!");
        // Reset state
        setCapturedImage(null);
      } else {
        Alert.alert("Error", "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  if (capturedImage) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      >
        <Image
          source={{ uri: capturedImage }}
          style={styles.fullScreenPreview}
        />
        <View style={styles.previewButtonContainer}>
          <TouchableOpacity
            style={[
              styles.previewButton,
              { backgroundColor: theme.secondaryText },
            ]}
            onPress={retakePicture}
          >
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.previewButton, { backgroundColor: theme.primary }]}
            onPress={uploadImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Upload</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Flip button positioned at top right */}
        <TouchableOpacity
          style={[styles.flipButton, { backgroundColor: theme.primary }]}
          onPress={toggleCameraFacing}
        >
          <Text style={styles.buttonText}>Flip</Text>
        </TouchableOpacity>
      </CameraView>

      {/* Capture button at bottom center */}
      <TouchableOpacity
        style={[styles.captureButton, { backgroundColor: theme.primary }]}
        onPress={takePicture}
      >
        <Text style={styles.buttonText}>Take Picture</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 15,
    margin: 5,
    borderRadius: 8,
  },
  flipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  preview: {
    flex: 1,
    width: "100%",
    resizeMode: "contain",
  },
  fullScreenPreview: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  previewButtonContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 40,
  },
  previewButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
  },
  captureButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 50,
    elevation: 5,
  },
});
