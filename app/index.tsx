import { Text, View, Image, ScrollView } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Image 
        source={{
          uri: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi1.wp.com%2Frangerrick.org%2Fwp-content%2Fuploads%2F2018%2F04%2FRRNOV13_22-27Komodos.jpg%3Ffit%3D1156%252C650%26ssl%3D1&f=1&nofb=1&ipt=586f2abba4e7dda2b190975ebd0fd11344fa08ab10b1818997bbd31f5a6713bb"
        }} 
        style={{ 
          width: "50%", height: "50%"}} />
    </View>
  );
}
