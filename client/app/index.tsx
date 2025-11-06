import {
  Text,
  View,
  useWindowDimensions,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  useFonts,
  SawarabiGothic_400Regular,
} from "@expo-google-fonts/sawarabi-gothic";
import React, { useState } from "react";

export default function Index() {
  const [fontsLoaded] = useFonts({ SawarabiGothic_400Regular });
  const deviceHeight = useWindowDimensions().height;
  const middleBoxHeight = (deviceHeight * 6.7) / 10;
  const lowerBoxHeight = (deviceHeight * 1) / 13;
  const [prompt, setPrompt] = useState("");

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading…</Text>
      </View>
    );
  }
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        // alignItems: "center",
        paddingTop: 60,
        paddingHorizontal: 20,
      }}
    >
      <ScrollView>
        {/* Top Box Greeting */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "800",
            marginBottom: 16,
            marginLeft: 12,
            fontFamily: "SawarabiGothic_400Regular",
          }}
        >
          Welcome, User
        </Text>
        {/* Placeholder box: For displaying outfits */}
        <View
          style={{
            height: middleBoxHeight,
            borderRadius: 12,
            backgroundColor: "#e6e6e6",
            padding: 16,
          }}
        >
          <Text style={styles.sectionTitle}>Recommended outfits for today</Text>
          <View style={styles.outfitGrid}>
            {[1, 2, 3, 4].map((outfitNumber) => (
              <View key={outfitNumber} style={styles.outfitContainer}>
                <View style={styles.outfitDisplayCard}>
                  {/* Empty display container */}
                </View>
                <Text style={styles.outfitLabel}>Outfit {outfitNumber}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Placeholder Box: For the AI chatbox */}
        <KeyboardAvoidingView
          style={{
            height: lowerBoxHeight,
            borderRadius: 12,
            backgroundColor: "#e6e6e6",
            marginTop: 12,
            padding: 8,
            justifyContent: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="What are we wearing today?"
              placeholderTextColor="#666"
              style={{
                flex: 1,
                height: 44,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: "#fff",
              }}
              returnKeyType="send"
              onSubmitEditing={() => {
                if (!prompt.trim()) return;
                console.log("Sending prompt:", prompt);
                setPrompt("");
              }}
              autoCorrect={false}
            />

            <TouchableOpacity
              onPress={() => {
                if (!prompt.trim()) return;
                console.log("Sending prompt:", prompt);
                setPrompt("");
              }}
              style={{
                height: 44,
                paddingHorizontal: 14,
                borderRadius: 8,
                backgroundColor: "#333",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "600",
                  fontFamily: "SawarabiGothic_400Regular",
                }}
              >
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
    fontFamily: "SawarabiGothic_400Regular",
  },
  outfitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  outfitContainer: {
    width: "48%",
    marginBottom: 16,
  },
  outfitDisplayCard: {
    aspectRatio: 0.8,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1e5e9",
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  outfitLabel: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    fontFamily: "SawarabiGothic_400Regular",
  },
});
