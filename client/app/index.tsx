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
  Modal,
  SafeAreaView,
} from "react-native";
import {
  useFonts,
  SawarabiGothic_400Regular,
} from "@expo-google-fonts/sawarabi-gothic";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Index() {
  const [fontsLoaded] = useFonts({ SawarabiGothic_400Regular });
  const deviceHeight = useWindowDimensions().height;
  const { theme } = useTheme();
  const middleBoxHeight = (deviceHeight * 6.7) / 10;
  const lowerBoxHeight = (deviceHeight * 1) / 13;
  const [prompt, setPrompt] = useState("");
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = () => {
    if (!prompt.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: prompt,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    console.log("Sending prompt:", prompt);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm here to help you find the perfect outfit! This is a placeholder response.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);

    setPrompt("");
  };

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.backgroundColor,
        }}
      >
        <Text style={{ color: theme.textColor }}>Loading…</Text>
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
        backgroundColor: theme.backgroundColor,
      }}
    >
      <ScrollView>
        {/* Top Box Greeting */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 16,
            marginLeft: 12,
            color: theme.textColor,
            // fontFamily: "SawarabiGothic_400Regular",
          }}
        >
          Welcome, User
        </Text>
        {/* Placeholder box: For displaying outfits */}
        <View
          style={{
            height: middleBoxHeight,
            borderRadius: 12,
            backgroundColor: theme.cardBackground,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.borderColor,
          }}
        >
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Recommended outfits for today
          </Text>
          <View style={styles.outfitGrid}>
            {[1, 2, 3, 4].map((outfitNumber) => (
              <View key={outfitNumber} style={styles.outfitContainer}>
                <View style={styles.outfitDisplayCard}>
                  {/* Empty display container */}
                </View>
                <Text style={[styles.outfitLabel, { color: theme.textColor }]}>
                  Outfit {outfitNumber}
                </Text>
              </View>
            ))}
          </View>
        </View>
        {/* Placeholder Box: For the AI chatbox */}
        <TouchableOpacity
          onPress={() => setIsChatModalVisible(true)}
          activeOpacity={0.7}
        >
          <View
            style={{
              height: lowerBoxHeight,
              borderRadius: 12,
              backgroundColor: theme.cardBackground,
              marginTop: 12,
              padding: 8,
              justifyContent: "center",
              borderWidth: 1,
              borderColor: theme.borderColor,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 44,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: theme.backgroundColor,
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: theme.borderColor,
                }}
              >
                <Text style={{ color: theme.secondaryText }}>
                  What are we wearing today?
                </Text>
              </View>

              <View
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
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Full Page Chat Modal */}
      <Modal
        visible={isChatModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsChatModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior="padding"
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <TouchableOpacity
                onPress={() => setIsChatModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
              <Text style={styles.chatHeaderTitle}>Outfit Assistant</Text>
              <View style={{ width: 28 }} />
            </View>

            {/* Messages */}
            <ScrollView
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyStateText}>
                    Start a conversation to get outfit recommendations!
                  </Text>
                </View>
              ) : (
                messages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageBubble,
                      message.isUser ? styles.userMessage : styles.aiMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.isUser && styles.userMessageText,
                      ]}
                    >
                      {message.text}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Chat Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  value={prompt}
                  onChangeText={setPrompt}
                  placeholder="What are we wearing today?"
                  placeholderTextColor="#666"
                  style={styles.chatInput}
                  returnKeyType="send"
                  onSubmitEditing={handleSendMessage}
                  autoCorrect={false}
                  multiline
                  maxLength={500}
                />

                <TouchableOpacity
                  onPress={handleSendMessage}
                  style={[
                    styles.sendButton,
                    !prompt.trim() && styles.sendButtonDisabled,
                  ]}
                  disabled={!prompt.trim()}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={prompt.trim() ? "#fff" : "#999"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  closeButton: {
    padding: 4,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    fontFamily: "SawarabiGothic_400Regular",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    fontFamily: "SawarabiGothic_400Regular",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4f46e5",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    fontFamily: "SawarabiGothic_400Regular",
  },
  userMessageText: {
    color: "#fff",
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e1e5e9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  chatInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: "#f8f9fa",
    fontSize: 16,
    color: "#333",
    fontFamily: "SawarabiGothic_400Regular",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#e1e5e9",
  },
});
