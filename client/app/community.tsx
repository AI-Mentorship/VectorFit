import { Text, useWindowDimensions, View } from "react-native";
import {
  useFonts,
  SawarabiGothic_400Regular,
} from "@expo-google-fonts/sawarabi-gothic";

export default function Community() {
  const [fontsLoaded] = useFonts({ SawarabiGothic_400Regular });
  const deviceHeight = useWindowDimensions().height;
  const mainBox = (deviceHeight * 7.8) / 10;
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        // alignItems: "center",
        paddingTop: 30,
        paddingHorizontal: 20,
      }}
    >
      {/* Greeting */}
      <Text
        style={{
          fontSize: 24,
          fontWeight: "800",
          marginBottom: 8,
          marginLeft: 12,
          fontFamily: "SawarabiGothic_400Regular",
        }}
      >
        Community
      </Text>
      {/* Community Page */}
      <Text
        style={{
          height: mainBox,
          backgroundColor: "#e6e6e6",
          borderRadius: 20,
        }}
      ></Text>
    </View>
  );
}
