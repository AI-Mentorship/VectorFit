import { Text, View } from "react-native";

export default function Create() {
  console.log("create page as been reached");
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Create page holder</Text>
    </View>
  );
}
