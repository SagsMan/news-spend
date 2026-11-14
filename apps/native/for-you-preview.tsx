/** Isolated browser entry for reviewing the For You prototype without API credentials. */
import "./src/global.css";
import { registerRootComponent } from "expo";
import { useFonts } from "expo-font";
import { HeroUINativeProvider } from "heroui-native/provider";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from "./src/components/heroui/text";
import { ForYouExperience } from "./src/features/for-you/ForYouExperience";
import {
  createProfile,
  demoProfile,
  type Profile,
} from "./src/features/for-you/model";

function Preview() {
  useFonts({
    "Inter-Regular": require("./assets/fonts/Inter-Regular.otf"),
    "Inter-Medium": require("./assets/fonts/Inter-Medium.otf"),
    "Inter-SemiBold": require("./assets/fonts/Inter-SemiBold.otf"),
    "Inter-Bold": require("./assets/fonts/Inter-Bold.otf"),
  });
  const [profile, setProfile] = useState<Profile>(createProfile);
  const [guest, setGuest] = useState(false);
  const [version, setVersion] = useState(0);
  const reset = (next: Profile, isGuest: boolean) => {
    setProfile(next);
    setGuest(isGuest);
    setVersion((previous) => previous + 1);
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HeroUINativeProvider
          config={{ devInfo: { stylingPrinciples: false } }}
        >
          <View
            style={{
              flex: 1,
              width: "100%",
              maxWidth: 480,
              alignSelf: "center",
            }}
          >
            <View className="flex-row flex-wrap gap-2 bg-surface p-2">
              {[
                { label: "New user", run: () => reset(createProfile(), false) },
                {
                  label: "Sample profile",
                  run: () => reset(demoProfile(), false),
                },
                { label: "Guest", run: () => reset(createProfile(), true) },
              ].map((item) => (
                <Pressable
                  accessibilityRole="button"
                  className="min-h-12 justify-center rounded-lg border border-border px-3"
                  key={item.label}
                  onPress={item.run}
                >
                  <Text>{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <ForYouExperience
              guest={guest}
              key={version}
              onChange={setProfile}
              onCreateAccount={() => reset(createProfile(), false)}
              profile={profile}
            />
          </View>
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
registerRootComponent(Preview);
