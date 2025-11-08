import {
  Text,
  useWindowDimensions,
  View,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import {
  useFonts,
  SawarabiGothic_400Regular,
} from "@expo-google-fonts/sawarabi-gothic";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

// Mock data for shared outfits
const mockOutfits = [
  {
    id: 1,
    user: "Sarah M.",
    outfit: "Outfit Name here",
    likes: 232,
    avatar: "S",
    color: "#FFE5E5",
  },
  {
    id: 2,
    user: "James K.",
    outfit: "Office Professional",
    likes: 189,
    avatar: "J",
    color: "#E5F3FF",
  },
  {
    id: 3,
    user: "Emma L.",
    outfit: "Street Style",
    likes: 312,
    avatar: "E",
    color: "#F0FFE5",
  },
  {
    id: 4,
    user: "Alex C.",
    outfit: "Outfit Name here",
    likes: 421,
    avatar: "A",
    color: "#FFE5F9",
  },
  {
    id: 5,
    user: "Nina P.",
    outfit: "Outfit Name here",
    likes: 276,
    avatar: "N",
    color: "#FFF5E5",
  },
  {
    id: 6,
    user: "David R.",
    outfit: "Weekend Brunch",
    likes: 198,
    avatar: "D",
    color: "#E5FFFA",
  },
];

export default function Community() {
  const [fontsLoaded] = useFonts({ SawarabiGothic_400Regular });
  const deviceHeight = useWindowDimensions().height;
  const mainBox = (deviceHeight * 7.6) / 10;
  const { theme } = useTheme();

  const styles = createStyles(theme, mainBox);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>
        Community
      </Text>

      {/* Community Feed */}
      <View style={styles.feedContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {mockOutfits.map((outfit) => (
            <View
              key={outfit.id}
              style={[styles.outfitCard, { borderColor: theme.borderColor }]}
            >
              {/* User Info */}
              <View style={styles.userInfoContainer}>
                <View
                  style={[styles.avatar, { backgroundColor: outfit.color }]}
                >
                  <Text style={styles.avatarText}>{outfit.avatar}</Text>
                </View>
                <View>
                  <Text style={styles.userName}>
                    {outfit.user}
                  </Text>
                  {/* Mock time */}
                  <Text style={styles.timeText}>
                    {Math.floor(Math.random() * 24) + 1}h ago
                  </Text>
                </View>
              </View>

              {/* Outfit Preview */}
              <View
                style={[styles.outfitPreview, { backgroundColor: outfit.color }]}
              >
                <Text style={styles.outfitName}>
                  {outfit.outfit}
                </Text>
              </View>

              {/* Engagement */}
              <View style={styles.engagementContainer}>
                <View style={styles.likesContainer}>
                  <Ionicons name="heart" size={18} color={theme.textColor} />
                  <Text style={styles.likesText}>
                    {outfit.likes}
                  </Text>
                </View>
                <View style={styles.actionsContainer}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={18}
                    color={theme.textColor}
                  />
                  <Ionicons
                    name="bookmark-outline"
                    size={18}
                    color={theme.textColor}
                  />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const createStyles = (theme: any, mainBox: number) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: theme.backgroundColor,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    marginLeft: 12,
    marginTop: 20,
    color: theme.textColor,
    // fontFamily: "SawarabiGothic_400Regular",
  },
  feedContainer: {
    height: mainBox,
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    gap: 12,
  },
  outfitCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "SawarabiGothic_400Regular",
    color: theme.textColor,
  },
  timeText: {
    fontSize: 12,
    color: theme.secondaryText,
    fontFamily: "SawarabiGothic_400Regular",
  },
  outfitPreview: {
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  outfitName: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    fontFamily: "SawarabiGothic_400Regular",
    color: theme.textColor,
  },
  engagementContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  likesText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "SawarabiGothic_400Regular",
    marginLeft: 5,
    color: theme.textColor,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 16,
  },
});
