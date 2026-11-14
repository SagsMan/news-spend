import {
  createNativeStackScreen,
  type NativeStackHeaderProps,
} from "@react-navigation/native-stack";
import { lazy } from "react";

import ScreenHeader from "#/components/ScreenHeader";
import NotFound from "#/screens/NotFound";
import ShopStack from "./shop-stack";

/**
 * Non-initial screens are lazy-loaded so the heavy libraries they import
 * (videos, lottery/prize flows, settings tooling) are only fetched and
 * executed when the screen is first navigated to, keeping the startup bundle
 * small.
 *
 * These MUST stay at module scope: declaring `lazy()` inside the navigator
 * config makes screens unmount/remount on every render.
 */
const PrivacyPolicy = lazy(
  () => import("#/features/auth/screens/privacy-policy")
);
const TermOfUse = lazy(() => import("#/features/auth/screens/term-of-use"));
const Activities = lazy(
  () => import("#/features/tabs/settings/screens/activities")
);
const BlockedUsers = lazy(
  () => import("#/features/tabs/settings/screens/blocked-users")
);
const CommunityGuidelines = lazy(
  () => import("#/features/tabs/settings/screens/community-guidelines")
);
const DataManager = lazy(
  () => import("#/features/tabs/settings/screens/data-manager")
);
const DeleteAccount = lazy(
  () => import("#/features/tabs/settings/screens/delete-account")
);
const IdentityVerification = lazy(
  () => import("#/features/tabs/settings/screens/identity-verification")
);
const LegalAgreement = lazy(
  () => import("#/features/tabs/settings/screens/legal")
);
const Notifications = lazy(
  () => import("#/features/tabs/settings/screens/notification")
);
const Profile = lazy(() => import("#/features/tabs/settings/screens/profile"));
const Report = lazy(() => import("#/features/tabs/settings/screens/report"));
const ShareApp = lazy(
  () => import("#/features/tabs/settings/screens/share-app")
);
const Socials = lazy(() => import("#/features/tabs/settings/screens/socials"));
const Advertise = lazy(
  () => import("#/features/tabs/settings/screens/support/advertise")
);
const Call = lazy(
  () => import("#/features/tabs/settings/screens/support/call")
);
const Email = lazy(
  () => import("#/features/tabs/settings/screens/support/email")
);
const FAQs = lazy(
  () => import("#/features/tabs/settings/screens/support/faqs")
);
const Feedback = lazy(
  () => import("#/features/tabs/settings/screens/support/feedback")
);
const Support = lazy(
  () => import("#/features/tabs/settings/screens/support/support")
);
const ShopDetails = lazy(
  () => import("#/features/tabs/shop/screens/ShopDetails")
);
const InAppBrowser = lazy(() => import("#/screens/common/InAppBrowser"));
const GameLauncher = lazy(() => import("#/screens/tabs/discover/GameLauncher"));
const ToastLab = lazy(() => import("#/screens/dev/ToastLab"));
const BoostLuck = lazy(() => import("#/screens/tabs/discover/BoostLuck"));
const ClaimPrize = lazy(() => import("#/screens/tabs/discover/ClaimPrize"));
const PrizeDetails = lazy(() => import("#/screens/tabs/discover/PrizeDetails"));
const GetTicket = lazy(() => import("#/screens/tabs/discover/GetTicket"));
const LotteryRules = lazy(() => import("#/screens/tabs/discover/LotteryRules"));
const LuckyAppWall = lazy(() => import("#/screens/tabs/discover/LuckyAppWall"));
const MyGiveaways = lazy(() => import("#/screens/tabs/discover/MyGiveaways"));
const EntryDetails = lazy(() => import("#/screens/tabs/discover/EntryDetails"));
const PlayLottery = lazy(() => import("#/screens/tabs/discover/PlayLottery"));
const CommentReplies = lazy(
  () => import("#/screens/tabs/home/comments/CommentReply")
);
const Comments = lazy(() => import("#/screens/tabs/home/comments/Comments"));
const SingleNews = lazy(() => import("#/screens/tabs/home/news"));

const ROUTE_TITLES = {
  Report: "IWitness Report",
  Notification: "Notification Manager",
  DataManager: "Data Manager",
  DeleteAccount: "Delete Account",
  Support: "Contact Us",
  FAQ: "Frequently Asked Questions",
  Advertise: "Advertising",
  Call: "Call Us",
  Email: "Email Customer Support",
  Feedback: "Send Feedback",
  Legal: "Legal Agreement",
  TermsOfUse: "Terms of Use",
  PrivacyPolicy: "Privacy Policy",
  ShareApp: "Share App",
  Socials: "Follow Us",
  IdentityVerification: "Verify Identity",
  CommunityGuidelines: "Community Guidelines",
  BlockedUsers: "Blocked Users",
  Profile: "Profile",
  Activities: "Activities",
} as const;

type RouteNames = keyof typeof ROUTE_TITLES;

function getRouteTitle(routeName: string): string {
  return ROUTE_TITLES[routeName as RouteNames] ?? routeName;
}

/**
 * Header for the settings-family detail screens. These used to inherit it
 * from their host tab stack; at root level the stack hides headers, so each
 * screen carries its own.
 */
export const detailScreenHeader = ({ route }: NativeStackHeaderProps) => {
  const title = getRouteTitle(route.name);

  return <ScreenHeader title={title} />;
};

const detailScreenOptions = {
  headerShown: true,
  header: detailScreenHeader,
} as const;

export const sharedScreens = {
  Shop: createNativeStackScreen({
    screen: ShopStack,
    linking: { path: "/shop", initialRouteName: "ShopHome" },
    options: { headerShown: false },
  }),
  News: createNativeStackScreen({
    screen: SingleNews,
    getId: ({ params }) => params?.slug,
    linking: {
      path: "/article/:slug/:id?",
      // The tab-prefixed form the share sheet used to mint
      // (`link.newsspend.com/news/article/<slug>`), and that links already
      // shared carry. The link host preserves the path verbatim, so this
      // reaches the router unchanged. Declared here as well as normalized in
      // `legacy-tab-prefix.ts` so the router resolves it even on a code path
      // that skips normalization.
      alias: ["/news/article/:slug/:id?"],
    },
    options: {
      headerShown: false,
    },
  }),
  Comment: createNativeStackScreen({
    screen: Comments,
    getId: ({ params }) => params?.newsSlug,
    linking: {
      path: "/article/:newsSlug/comment",
      alias: ["/news/article/:newsSlug/comment"],
    },
    options: {
      headerShown: false,
      // slide up from bottom
      animation: "slide_from_bottom",
    },
  }),
  CommentReply: createNativeStackScreen({
    screen: CommentReplies,
    getId: ({ params }) => params?.newsSlug,
    linking: {
      path: "/article/:newsSlug/comment/:commentId/:highlightCommentId?",
      alias: [
        "/news/article/:newsSlug/comment/:commentId/:highlightCommentId?",
      ],
    },
    options: {
      // presentation: "modal",
      animation: "slide_from_bottom",
    },
  }),
  ShopDetails: createNativeStackScreen({
    screen: ShopDetails,
    getId: ({ params }) => params?.slug,
    linking: {
      path: "/detail/:slug",
    },
    options: {
      headerShown: false,
    },
  }),
  Profile: createNativeStackScreen({
    screen: Profile,
    linking: {
      path: "profile",
    },
    options: { ...detailScreenOptions },
  }),
  Activities: createNativeStackScreen({
    screen: Activities,
    linking: {
      path: "activities",
    },
    options: { ...detailScreenOptions },
  }),
  BlockedUsers: createNativeStackScreen({
    screen: BlockedUsers,
    linking: {
      path: "blocked-users",
    },
    options: { ...detailScreenOptions },
  }),
  Report: createNativeStackScreen({
    screen: Report,
    linking: {
      path: "report",
    },
    options: { ...detailScreenOptions },
  }),
  Notification: createNativeStackScreen({
    screen: Notifications,
    linking: {
      path: "notification",
    },
    options: { ...detailScreenOptions },
  }),
  DataManager: createNativeStackScreen({
    screen: DataManager,
    linking: {
      path: "data-manager",
    },
    options: { ...detailScreenOptions },
  }),
  DeleteAccount: createNativeStackScreen({
    screen: DeleteAccount,
    linking: {
      path: "delete-account",
    },
    options: { ...detailScreenOptions },
  }),
  ShareApp: createNativeStackScreen({
    screen: ShareApp,
    linking: {
      path: "share-app",
    },
    options: { ...detailScreenOptions },
  }),
  Socials: createNativeStackScreen({
    screen: Socials,
    linking: {
      path: "socials",
    },
    options: { ...detailScreenOptions },
  }),
  Support: createNativeStackScreen({
    screen: Support,
    linking: {
      path: "support",
    },
    options: { ...detailScreenOptions },
  }),
  IdentityVerification: createNativeStackScreen({
    screen: IdentityVerification,
    linking: {
      path: "identity-verification",
    },
    options: { ...detailScreenOptions },
  }),
  Advertise: createNativeStackScreen({
    screen: Advertise,
    linking: {
      path: "advertise",
    },
    options: { ...detailScreenOptions },
  }),
  Call: createNativeStackScreen({
    screen: Call,
    linking: {
      path: "call",
    },
    options: { ...detailScreenOptions },
  }),
  Feedback: createNativeStackScreen({
    screen: Feedback,
    linking: {
      path: "feedback",
    },
    options: { ...detailScreenOptions },
  }),
  FAQ: createNativeStackScreen({
    screen: FAQs,
    linking: {
      path: "faq",
    },
    options: { ...detailScreenOptions },
  }),
  Email: createNativeStackScreen({
    screen: Email,
    linking: {
      path: "email",
    },
    options: { ...detailScreenOptions },
  }),
  Legal: createNativeStackScreen({
    screen: LegalAgreement,
    linking: {
      path: "legal",
    },
    options: { ...detailScreenOptions },
  }),
  TermsOfUse: createNativeStackScreen({
    screen: TermOfUse,
    linking: {
      path: "terms-of-use",
    },
    options: { ...detailScreenOptions },
  }),
  PrivacyPolicy: createNativeStackScreen({
    screen: PrivacyPolicy,
    linking: {
      path: "privacy-policy",
    },
    options: { ...detailScreenOptions },
  }),
  CommunityGuidelines: createNativeStackScreen({
    screen: CommunityGuidelines,
    linking: {
      path: "community-guidelines",
    },
    options: { ...detailScreenOptions },
  }),
  // // Discover screens
  PlayLottery: createNativeStackScreen({
    screen: PlayLottery,
    linking: {
      path: "play-lottery",
    },
    options: {
      headerShown: false,
    },
  }),
  GetTicket: createNativeStackScreen({
    screen: GetTicket,
    linking: {
      path: "buy-ticket",
    },
    options: {
      headerShown: false,
    },
  }),
  BoostLuck: createNativeStackScreen({
    screen: BoostLuck,
    linking: {
      path: "boost-luck",
    },
    options: {
      headerShown: false,
    },
  }),
  LuckyAppWall: createNativeStackScreen({
    screen: LuckyAppWall,
    linking: {
      path: "lucky-app-wall",
    },
    options: {
      headerShown: false,
    },
  }),
  MyGiveaways: createNativeStackScreen({
    screen: MyGiveaways,
    linking: {
      path: "my-giveaways",
    },
    options: {
      headerShown: false,
    },
  }),
  EntryDetails: createNativeStackScreen({
    screen: EntryDetails,
    linking: {
      path: "entry-details/:giveawayId",
    },
    options: {
      headerShown: false,
    },
  }),
  ClaimPrize: createNativeStackScreen({
    screen: ClaimPrize,
    linking: {
      path: "claim-prize/:winnerId",
    },
    options: {
      headerShown: false,
    },
  }),
  PrizeDetails: createNativeStackScreen({
    screen: PrizeDetails,
    linking: {
      path: "prize/:winnerId",
    },
    options: {
      headerShown: false,
    },
  }),
  LotteryRules: createNativeStackScreen({
    screen: LotteryRules,
    linking: {
      path: "lottery-rules",
    },
    options: {
      headerShown: false,
    },
  }),
  InAppBrowser: createNativeStackScreen({
    screen: InAppBrowser,
    linking: {
      path: "browser",
    },
    options: {
      headerShown: false,
    },
  }),
  // Where a game is opened from, in the app or by its universal link
  // (https://link.newsspend.com/games/<name>). See GameLauncher.
  Game: createNativeStackScreen({
    screen: GameLauncher,
    linking: {
      path: "games/:namespace",
    },
    options: {
      headerShown: false,
    },
  }),
  // Kept so the `survey` deep link and any cached navigation state keep working.
  SurveyWebView: createNativeStackScreen({
    screen: InAppBrowser,
    linking: {
      path: "survey",
    },
    options: {
      headerShown: false,
    },
  }),
  // Bench for the HeroUI toast wrapper. Dev builds only: `news-spend://toast-lab`.
  ...(__DEV__
    ? {
        ToastLab: createNativeStackScreen({
          screen: ToastLab,
          linking: {
            path: "toast-lab",
          },
          options: { ...detailScreenOptions },
        }),
      }
    : {}),
  NotFound: createNativeStackScreen({
    screen: NotFound,
    linking: {
      path: "*",
    },
    options: { ...detailScreenOptions },
  }),
};
