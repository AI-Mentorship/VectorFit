import {
  Text,
  View,
  useWindowDimensions,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
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
      {/* Top Box Greeting */}
      <Text
        style={{
          fontSize: 24,
          fontWeight: "800",
          marginBottom: 12,
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
          padding: 12,
          justifyContent: "center",
        }}
      >
        <Text></Text>
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
    </View>
  );
}
