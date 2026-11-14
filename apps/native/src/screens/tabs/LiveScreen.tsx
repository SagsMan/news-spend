import { View } from "react-native";
import { Text } from "#/components/heroui/text";

// The existing News collection rejects video content. Do not request an unsupported feed.
export default function LiveScreen() {
  return (
    <View className="flex-1 bg-background">
      <View className="bg-p-500 px-4 pt-safe-offset-4 pb-4">
        <Text className="text-white" variant="HeadingLarge">
          Live
        </Text>
      </View>
      <View className="flex-1 justify-center gap-3 px-6 pb-24">
        <Text variant="HeadingMedium">Live coverage isn't available yet</Text>
        <Text>
          When NewsSpend offers live coverage, you'll find it here. Explore the
          latest stories on Home in the meantime.
        </Text>
      </View>
    </View>
  );
}
