import {
  Text,
  useWindowDimensions,
  View,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
} from "react-native";
import {
  useFonts,
  SawarabiGothic_400Regular,
} from "@expo-google-fonts/sawarabi-gothic";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const [fontsLoaded] = useFonts({ SawarabiGothic_400Regular });
  const deviceHeight = useWindowDimensions().height;
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme colors based on dark/light mode
  const theme = {
    backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
    textColor: isDarkMode ? "#ffffff" : "#000000",
    cardBackground: isDarkMode ? "#2a2a2a" : "#f5f5f5",
    borderColor: isDarkMode ? "#444444" : "#e0e0e0",
  };
  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading...</Text>
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
        paddingTop: 100,
        paddingHorizontal: 30,
        paddingBottom: 40,
      }}
    >
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
            backgroundColor: isDarkMode ? "#333" : "#e6e6e6",
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
            color: isDarkMode ? "#888" : "#666",
            marginBottom: 20,
          }}
        >
          Fashion Enthusiast
        </Text>
      </View>

      {/* Settings Section */}
      <View
        style={{
          backgroundColor: theme.cardBackground,
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            color: theme.textColor,
            marginBottom: 20,
          }}
        >
          Settings
        </Text>

        {/* Theme Toggle */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name={isDarkMode ? "moon" : "sunny"}
              size={24}
              color={theme.textColor}
              style={{ marginRight: 15 }}
            />
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: theme.textColor,
                }}
              >
                Dark Mode
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: isDarkMode ? "#888" : "#666",
                  marginTop: 2,
                }}
              >
                {isDarkMode ? "Dark theme enabled" : "Light theme enabled"}
              </Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: "#e0e0e0", true: "#4CAF50" }}
            thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
          />
        </View>

        {/* Other Settings (Mock) */}
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
              Notifications
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDarkMode ? "#888" : "#666",
                marginTop: 2,
              }}
            >
              Push notifications and alerts
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDarkMode ? "#888" : "#666"}
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
            name="settings"
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
              Preferences
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDarkMode ? "#888" : "#666",
                marginTop: 2,
              }}
            >
              App preferences and privacy
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDarkMode ? "#888" : "#666"}
          />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View
        style={{
          backgroundColor: theme.cardBackground,
          borderRadius: 12,
          padding: 20,
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
            color: isDarkMode ? "#888" : "#666",
            lineHeight: 20,
          }}
        >
          VectorFit helps you discover your perfect style with AI-powered
          recommendations and a vibrant community of fashion enthusiasts.
        </Text>
      </View>
    </ScrollView>
  );
}
