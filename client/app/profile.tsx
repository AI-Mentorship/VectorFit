import {
  Text,
  useWindowDimensions,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  SafeAreaView,
  Switch,
} from "react-native";
import {
  useFonts,
  SawarabiGothic_400Regular,
} from "@expo-google-fonts/sawarabi-gothic";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

export default function Profile() {
  const [fontsLoaded] = useFonts({ SawarabiGothic_400Regular });
  const deviceHeight = useWindowDimensions().height;
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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
        <Text style={{ color: theme.textColor }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.backgroundColor,
      }}
      contentContainerStyle={{
        paddingTop: 60,
        paddingHorizontal: 30,
        paddingBottom: 40,
      }}
    >
      {/* Header with Settings Gear */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingTop: 40,
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowSettingsModal(true)}
          style={{
            padding: 10,
            borderRadius: 25,
            backgroundColor: theme.cardBackground,
            borderWidth: 1,
            borderColor: theme.borderColor,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <Ionicons name="settings-outline" size={24} color={theme.textColor} />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View
        style={{
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        {/* Profile Pic */}
        <TouchableOpacity
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.cardBackground,
            borderWidth: 2,
            borderColor: theme.borderColor,
            justifyContent: "center",
            alignItems: "center",
            elevation: 3,
            shadowRadius: 4,
            marginBottom: 20,
          }}
        >
          <Image
            source={require("../assets/images/spinning-cat.gif")}
            style={{ width: 120, height: 120, borderRadius: 60 }}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* User Name */}
        <Text
          style={{
            fontSize: 30,
            fontWeight: "800",
            fontFamily: "SawarabiGothic_400Regular",
            color: theme.textColor,
            marginBottom: 10,
          }}
        >
          O-I-I-A-I-O
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: theme.secondaryText,
            marginBottom: 20,
          }}
        >
          Fashion Enthusiast
        </Text>
      </View>

      {/* About Section */}
      <View
        style={{
          backgroundColor: theme.cardBackground,
          borderRadius: 12,
          padding: 20,
          borderWidth: 1,
          borderColor: theme.borderColor,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: theme.textColor,
            marginBottom: 15,
          }}
        >
          About
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.secondaryText,
            lineHeight: 20,
          }}
        >
          VectorFit helps you discover your perfect style with AI-powered
          recommendations and a vibrant community of fashion enthusiasts.
        </Text>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: theme.backgroundColor }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 15,
              borderBottomWidth: 1,
              borderBottomColor: theme.borderColor,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowSettingsModal(false)}
              style={{
                padding: 8,
                borderRadius: 8,
              }}
            >
              <Ionicons name="close" size={24} color={theme.textColor} />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: theme.textColor,
              }}
            >
              Settings
            </Text>

            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 20,
            }}
          >
            {/* Theme Settings */}
            <View
              style={{
                backgroundColor: theme.cardBackground,
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: theme.borderColor,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: theme.textColor,
                  marginBottom: 20,
                }}
              >
                Appearance
              </Text>

              {/* Enhanced Theme Toggle */}
              <View
                style={{
                  backgroundColor: isDarkMode ? "#1f1f1f" : "#ffffff",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 15,
                  borderWidth: 2,
                  borderColor: isDarkMode ? "#4f46e5" : "#e0e0e0",
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: isDarkMode ? "#4f46e5" : "#f0f0f0",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 15,
                      }}
                    >
                      <Ionicons
                        name={isDarkMode ? "moon" : "sunny"}
                        size={20}
                        color={isDarkMode ? "#ffffff" : "#4f46e5"}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "600",
                          color: theme.textColor,
                          marginBottom: 2,
                        }}
                      >
                        {isDarkMode ? "Dark Mode" : "Light Mode"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: theme.secondaryText,
                        }}
                      >
                        {isDarkMode
                          ? "Switch to light theme"
                          : "Switch to dark theme"}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    trackColor={{
                      false: "#e0e0e0",
                      true: "#4f46e5",
                    }}
                    thumbColor={isDarkMode ? "#ffffff" : "#4f46e5"}
                    style={{
                      transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Notification Settings */}
            <View
              style={{
                backgroundColor: theme.cardBackground,
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: theme.borderColor,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: theme.textColor,
                  marginBottom: 20,
                }}
              >
                Notifications
              </Text>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.borderColor,
                }}
              >
                <Ionicons
                  name="notifications"
                  size={24}
                  color={theme.textColor}
                  style={{ marginRight: 15 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: theme.textColor,
                    }}
                  >
                    Push Notifications
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.secondaryText,
                      marginTop: 2,
                    }}
                  >
                    Get notified about new outfit recommendations
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.secondaryText}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 15,
                }}
              >
                <Ionicons
                  name="mail"
                  size={24}
                  color={theme.textColor}
                  style={{ marginRight: 15 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: theme.textColor,
                    }}
                  >
                    Email Updates
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.secondaryText,
                      marginTop: 2,
                    }}
                  >
                    Weekly style tips and updates
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.secondaryText}
                />
              </TouchableOpacity>
            </View>

            {/* App Preferences */}
            <View
              style={{
                backgroundColor: theme.cardBackground,
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: theme.borderColor,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: theme.textColor,
                  marginBottom: 20,
                }}
              >
                Preferences
              </Text>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.borderColor,
                }}
              >
                <Ionicons
                  name="lock-closed"
                  size={24}
                  color={theme.textColor}
                  style={{ marginRight: 15 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: theme.textColor,
                    }}
                  >
                    Privacy
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.secondaryText,
                      marginTop: 2,
                    }}
                  >
                    Manage your data and privacy settings
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.secondaryText}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 15,
                }}
              >
                <Ionicons
                  name="language"
                  size={24}
                  color={theme.textColor}
                  style={{ marginRight: 15 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: theme.textColor,
                    }}
                  >
                    Language
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.secondaryText,
                      marginTop: 2,
                    }}
                  >
                    English (US)
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.secondaryText}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}
