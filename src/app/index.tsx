import { StyleSheet, Text, View } from "react-native";
import { Link, Stack } from "expo-router";
import { useImage } from "expo-image";

const AVATAR_URL = "https://picsum.photos/id/237/512/512";

export default function HomeScreen() {
  const image = useImage(AVATAR_URL, { maxWidth: 36, maxHeight: 36 });

  return (
    <View style={styles.container}>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="Image prop button, right placement"
          icon="person.crop.circle.fill"
          image={image}
          onPress={() => {}}
        />
        <Stack.Toolbar.Button
          accessibilityLabel="Icon source button, right placement"
          icon={{ uri: AVATAR_URL }}
          onPress={() => {}}
        />
      </Stack.Toolbar>
      <Stack.Toolbar>
        <Stack.Toolbar.Button
          accessibilityLabel="Image prop button, bottom placement"
          icon="person.crop.circle.fill"
          image={image}
          onPress={() => {}}
        />
      </Stack.Toolbar>
      <Text style={styles.text}>
        {
          "Right toolbar, first button: `image` prop with a decoded 36px expo-image ref. Expected: 36pt avatar. Actual: SF Symbol placeholder, the decoded image is ignored.\nRight toolbar, second button: `icon={{ uri }}` with a 512px source. Actual: renders at natural pixel size and overflows the bar.\nBottom toolbar: same `image` prop, no placement. Actual: works."
        }
      </Text>
      <Link href="https://github.com/expo/expo" style={styles.link}>
        upstream issue
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 24,
  },
  text: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: "#0a7ea4",
  },
});
