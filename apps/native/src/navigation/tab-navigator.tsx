import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";
import LiveScreen from "#/screens/tabs/LiveScreen";
import DiscoverStack from "./discover-stack";
import ForYouStack from "./for-you-stack";
import NewsStack from "./home-stack";
import SettingsStack from "./settings-stack";

// Dark navy backing the native bar (matches splash + p-500).
const TAB_BAR_BACKGROUND = "#00233D";

export default createBottomTabNavigator({
  // No `tabBar` prop: with `implementation: "native"` that is what hides the
  // native UITabBarController / BottomNavigationView and renders a JS bar
  // instead. Omitting it reveals the platform bar.
  implementation: "native",
  backBehavior: "history",
  screens: {
    Home: {
      linking: {
        path: "news",
        initialRouteName: "NewsHome",
      },
      screen: NewsStack,
      options: {
        tabBarIcon: ({ focused }) =>
          Platform.select({
            ios: {
              type: "sfSymbol",
              name: focused ? "house.fill" : "house",
            },
            android: { type: "materialSymbol", name: "house" },
          }),
      },
    },
    Live: {
      screen: LiveScreen,
      linking: { path: "live" },
      options: {
        tabBarIcon: () =>
          Platform.select({
            ios: { type: "sfSymbol", name: "play.tv" },
            android: { type: "materialSymbol", name: "live_tv" },
          }),
      },
    },
    ForYou: {
      screen: ForYouStack,
      linking: { path: "for-you", initialRouteName: "ForYouHome" },
      options: {
        title: "For You",
        tabBarIcon: () =>
          Platform.select({
            ios: { type: "sfSymbol", name: "sparkles" },
            android: { type: "materialSymbol", name: "auto_awesome" },
          }),
      },
    },
    Discover: {
      linking: {
        path: "discover",
        initialRouteName: "DiscoverHome",
      },
      screen: DiscoverStack,
      options: {
        // NOTE: materialSymbol 'tag' rasterizes as "#" on Android (see
        // tab-bar '#" report 2026-09-28); 'sell' is the equivalent tag glyph.
        tabBarIcon: ({ focused }) =>
          Platform.select({
            ios: {
              type: "sfSymbol",
              name: focused ? "tag.fill" : "tag",
            },
            android: { type: "materialSymbol", name: "sell" },
          }),
      },
    },
    Me: {
      linking: {
        path: "settings",
        initialRouteName: "SettingsHome",
      },
      screen: SettingsStack,
      options: {
        title: "Me",
        tabBarIcon: ({ focused }) =>
          Platform.select({
            ios: {
              type: "sfSymbol",
              name: focused ? "person.fill" : "person",
            },
            android: { type: "materialSymbol", name: "person" },
          }),
      },
    },
  },
  screenOptions: {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: TAB_BAR_BACKGROUND,
    },
    // iOS 26+ renders a light adaptive glass bar: the active tab needs a
    // dark tint to read on it. Android keeps the solid navy bar, so the
    // active tab stays white there.
    tabBarActiveTintColor: Platform.select({
      ios: TAB_BAR_BACKGROUND,
      android: "#FFFFFF",
    }),
    tabBarInactiveTintColor: "#9CA3AF",
    // Android Material 3 pill behind the active icon.
    tabBarActiveIndicatorColor: "rgba(255,255,255,0.24)",
    tabBarRippleColor: "rgba(255,255,255,0.32)",
  },
  initialRouteName: "Home",
});
