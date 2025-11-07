import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

function TabsContent() {
  const router = useRouter();
  const { theme } = useTheme();

  const CenterTabButton = ({ onPress }: any) => (
    <TouchableOpacity
      style={styles.centerContainer}
      activeOpacity={0.85}
      onPress={() => {
        router.push("/create");
        if (onPress) onPress();
      }}
    >
      <View style={styles.centerButton}>
        <Ionicons name="add" size={32} color="#000" />
      </View>
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondaryText,
        tabBarStyle: {
          height: 80,
          paddingBottom: Platform.OS === "ios" ? 0 : 6,
          paddingTop: 6,
          backgroundColor: theme.cardBackground,
          borderTopColor: theme.borderColor,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: (props) => <CenterTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: "Wardrobe",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shirt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TabsContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    top: Platform.OS === "android" ? -20 : -20,
    justifyContent: "center",
    alignItems: "center",
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#d2d9bd",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
});
