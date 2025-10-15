import { Text, View } from "react-native";
import {
  useFonts,
  SawarabiGothic_400Regular,
} from "@expo-google-fonts/sawarabi-gothic";

export default function Index() {
  const [fontsLoaded] = useFonts({ SawarabiGothic_400Regular });
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
      <Text
        style={{
          fontSize: 24,
          fontWeight: "800",
          marginBottom: 12,
          fontFamily: "SawarabiGothic_400Regular",
        }}
      >
        Welcome, User
      </Text>
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
