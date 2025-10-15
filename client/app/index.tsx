import { Text, View, useWindowDimensions } from "react-native";
import {
  useFonts,
  SawarabiGothic_400Regular,
} from "@expo-google-fonts/sawarabi-gothic";

export default function Index() {
  const [fontsLoaded] = useFonts({ SawarabiGothic_400Regular });
  const deviceHeight = useWindowDimensions().height;
  const middleBoxHeight = (deviceHeight * 6) / 9;
  const lowerBoxHeight = (deviceHeight * 1) / 9;
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
          marginTop: 12,
          padding: 12,
          justifyContent: "center",
        }}
      >
        <Text>Middle placeholder box</Text>
      </View>

      {/* Placeholder Box: For the AI chatbox */}
      <View
        style={{
          height: lowerBoxHeight,
          borderRadius: 12,
          backgroundColor: "#e6e6e6",
          marginTop: 12,
          padding: 12,
          justifyContent: "center",
        }}>
          <Text>Bottom placeholder box</Text>
      </View>

    </View>
  );
}
