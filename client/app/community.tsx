import { Text, useWindowDimensions, View, ScrollView, Image } from "react-native";
import {
  useFonts,
  SawarabiGothic_400Regular,
} from "@expo-google-fonts/sawarabi-gothic";
import { Ionicons } from "@expo/vector-icons";

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
  
  return (
    <View
      style={{
        flex: 1,
        paddingTop: 40,
        paddingHorizontal: 20,
      }}
    >
      {/* Header */}
      <Text
        style={{
          fontSize: 24,
          fontWeight: "800",
          marginBottom: 16,
          marginLeft: 12,
          marginTop: 20,
          fontFamily: "SawarabiGothic_400Regular",
        }}
      >
        Community
      </Text>
      
      {/* Community Feed */}
      <View
        style={{
          height: mainBox,
          backgroundColor: "#e6e6e6",
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            gap: 12,
          }}
        >
          {mockOutfits.map((outfit) => (
            <View
              key={outfit.id}
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {/* User Info */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: outfit.color,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{outfit.avatar}</Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      fontFamily: "SawarabiGothic_400Regular",
                    }}
                  >
                    {outfit.user}
                  </Text>
                  {/* Mock time */}
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#666",
                      fontFamily: "SawarabiGothic_400Regular",
                    }}
                  >
                    {Math.floor(Math.random() * 24) + 1}h ago
                  </Text>
                </View>
              </View>

              {/* Outfit Preview */}
              <View
                style={{
                  height: 200,
                  backgroundColor: outfit.color,
                  borderRadius: 12,
                  marginBottom: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginTop: 8,
                    fontFamily: "SawarabiGothic_400Regular",
                  }}
                >
                  {outfit.outfit}
                </Text>
              </View>

              {/* Engagement */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="heart" size={18} color="black" />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      fontFamily: "SawarabiGothic_400Regular",
                      marginLeft: 5,
                    }}
                  >
                    {outfit.likes}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="black" />
                  <Ionicons name="bookmark-outline" size={18} color="black" />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
