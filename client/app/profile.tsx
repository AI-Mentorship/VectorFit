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
  StyleSheet,
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

  const styles = createStyles(theme, isDarkMode);

  if (!fontsLoaded || typeof isDarkMode !== "boolean") {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
    >
      {/* Header with Settings Gear */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setShowSettingsModal(true)}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={theme.textColor} />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        {/* Profile Pic */}
        <TouchableOpacity style={styles.profilePicContainer}>
          <Image
            source={require("../assets/images/spinning-cat.gif")}
            style={styles.profilePic}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* User Name */}
        <Text style={styles.userName}>
          O-I-I-A-I-O
        </Text>

        <Text style={styles.userTitle}>
          Fashion Enthusiast
        </Text>
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>
          About
        </Text>
        <Text style={styles.aboutText}>
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
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowSettingsModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.textColor} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              Settings
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
          >
            {/* Theme Settings */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>
                Appearance
              </Text>

              {/* Enhanced Theme Toggle */}
              <View style={styles.themeToggleContainer}>
                <View style={styles.themeToggleRow}>
                  <View style={styles.themeToggleContent}>
                    <View style={styles.themeIconContainer}>
                      <Ionicons
                        name={isDarkMode ? "moon" : "sunny"}
                        size={20}
                        color={isDarkMode ? "#ffffff" : "#4f46e5"}
                      />
                    </View>
                    <View style={styles.themeTextContainer}>
                      <Text style={styles.themeTitle}>
                        {isDarkMode ? "Dark Mode" : "Light Mode"}
                      </Text>
                      <Text style={styles.themeSubtitle}>
                        {isDarkMode
                          ? "Switch to light theme"
                          : "Switch to dark theme"}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    trackColor={styles.switchTrackColor}
                    thumbColor={styles.switchThumbColor}
                    style={styles.switch}
                  />
                </View>
              </View>
            </View>

            {/* Notification Settings */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>
                Notifications
              </Text>

              <TouchableOpacity style={styles.settingsItemWithBorder}>
                <Ionicons
                  name="notifications"
                  size={24}
                  color={theme.textColor}
                  style={styles.settingsIcon}
                />
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemTitle}>
                    Push Notifications
                  </Text>
                  <Text style={styles.settingsItemSubtitle}>
                    Get notified about new outfit recommendations
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.secondaryText}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingsItem}>
                <Ionicons
                  name="mail"
                  size={24}
                  color={theme.textColor}
                  style={styles.settingsIcon}
                />
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemTitle}>
                    Email Updates
                  </Text>
                  <Text style={styles.settingsItemSubtitle}>
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
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>
                Preferences
              </Text>

              <TouchableOpacity style={styles.settingsItemWithBorder}>
                <Ionicons
                  name="lock-closed"
                  size={24}
                  color={theme.textColor}
                  style={styles.settingsIcon}
                />
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemTitle}>
                    Privacy
                  </Text>
                  <Text style={styles.settingsItemSubtitle}>
                    Manage your data and privacy settings
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.secondaryText}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingsItem}>
                <Ionicons
                  name="language"
                  size={24}
                  color={theme.textColor}
                  style={styles.settingsIcon}
                />
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemTitle}>
                    Language
                  </Text>
                  <Text style={styles.settingsItemSubtitle}>
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

const createStyles = (theme: any, isDarkMode: boolean) => {
  const switchTrackColor = {
    false: "#abababff",
    true: "#4f46e5",
  };
  
  const switchThumbColor = isDarkMode ? "#ffffff" : "#4f46e5";
  
  return {
    ...StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.backgroundColor,
  },
  loadingText: {
    color: theme.textColor,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  scrollViewContent: {
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 40,
    marginBottom: 20,
  },
  settingsButton: {
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
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  profilePicContainer: {
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
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  userName: {
    fontSize: 30,
    fontWeight: "800",
    fontFamily: "SawarabiGothic_400Regular",
    color: theme.textColor,
    marginBottom: 10,
  },
  userTitle: {
    fontSize: 16,
    color: theme.secondaryText,
    marginBottom: 20,
  },
  aboutSection: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.textColor,
    marginBottom: 15,
  },
  aboutText: {
    fontSize: 14,
    color: theme.secondaryText,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.textColor,
  },
  headerSpacer: {
    width: 40,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  settingsSection: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.textColor,
    marginBottom: 20,
  },
  themeToggleContainer: {
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
  },
  themeToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  themeToggleContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDarkMode ? "#4f46e5" : "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  themeTextContainer: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.textColor,
    marginBottom: 2,
  },
  themeSubtitle: {
    fontSize: 14,
    color: theme.secondaryText,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  settingsItemWithBorder: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  settingsIcon: {
    marginRight: 15,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.textColor,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: theme.secondaryText,
    marginTop: 2,
  },
    }),
    switchTrackColor,
    switchThumbColor,
  };
};
