import {
  Text,
  useWindowDimensions,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  useFonts,
  SawarabiGothic_400Regular,
} from "@expo-google-fonts/sawarabi-gothic";

export default function Profile() {
  const [fontsLoaded] = useFonts({ SawarabiGothic_400Regular });
  const deviceHeight = useWindowDimensions().height;
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
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 60,
        paddingHorizontal: 20,
      }}
    >
      {/* Profile Pic */}
      <View
        style={{
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "#e6e6e6",
            borderWidth: 2,
            borderColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
            elevation: 3, // Android shadow
            shadowRadius: 4, // IOS shadow
          }}
        >
          <Image
            source={require("../assets/images/spinning-cat.gif")}
            style={{ width: 120, height: 120, borderRadius: 60 }}
            resizeMode="cover"
          ></Image>
        </TouchableOpacity>
      </View>

      {/* User First+Last Name */}
      <Text
        style={{
          fontSize: 30,
          fontWeight: "800",
          fontFamily: "SawarabiGothic_400Regular",
          marginBottom: 20,
        }}
      >
        Name Here
      </Text>
    </View>
  );
}
