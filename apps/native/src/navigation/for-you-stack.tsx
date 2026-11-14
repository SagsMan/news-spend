import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { lazy, Suspense } from "react";
import { View } from "react-native";
import { NavigatorErrorBoundary } from "#/components/ErrorBoundaries/NavigatorErrorBoundary";

const ForYouScreen = lazy(() => import("#/features/for-you/ForYouScreen"));
export default createNativeStackNavigator({
  layout: ({ children }) => (
    <NavigatorErrorBoundary>{children}</NavigatorErrorBoundary>
  ),
  screenLayout: ({ children }) => (
    <Suspense fallback={<View className="flex-1 bg-background" />}>
      {children}
    </Suspense>
  ),
  screens: { ForYouHome: { screen: ForYouScreen, linking: { path: "" } } },
  screenOptions: { headerShown: false },
});
