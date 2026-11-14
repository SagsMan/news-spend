import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Switch,
  View,
} from "react-native";
import { Text } from "#/components/heroui/text";
import {
  BookmarkSimpleIcon,
  DotsThreeVerticalIcon,
  ShareIcon,
  SparkleIcon,
} from "#/lib/icons";
import {
  interests,
  interestTitle,
  type Opportunity,
  opportunities,
  reportReasons,
} from "./catalog";
import {
  buildFeed,
  deadlineLabel,
  demoProfile,
  isClosed,
  type Profile,
  recommendationReason,
  updateSignal,
} from "./model";

type Page =
  | "intro"
  | "interests"
  | "refine"
  | "feed"
  | "detail"
  | "saved"
  | "dna"
  | "preferences"
  | "notifications"
  | "menu"
  | "report"
  | "why"
  | "reminder";
type Props = {
  profile: Profile;
  onChange: (profile: Profile) => void;
  guest: boolean;
  onCreateAccount: () => void;
  persistenceError?: boolean;
};

function Action({
  label,
  onPress,
  primary = false,
  selected,
  children,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  selected?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole={selected === undefined ? "button" : "checkbox"}
      accessibilityState={
        selected === undefined ? undefined : { checked: selected }
      }
      aria-checked={selected}
      className={
        primary
          ? "min-h-12 flex-row items-center justify-center gap-2 rounded-xl bg-p-500 px-4 py-3"
          : selected
            ? "min-h-12 flex-row items-center justify-center gap-2 rounded-xl border border-p-500 bg-p-500 px-4 py-3"
            : "min-h-12 flex-row items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3"
      }
      onPress={onPress}
    >
      {children}
      <Text
        className={
          primary || selected
            ? "font-semibold text-white"
            : "font-medium text-foreground"
        }
      >
        {selected ? "✓ " : ""}
        {label}
      </Text>
    </Pressable>
  );
}
function Heading({ children }: { children: React.ReactNode }) {
  return (
    <Text accessibilityRole="header" variant="HeadingMedium">
      {children}
    </Text>
  );
}
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
      {children}
    </View>
  );
}
function Toggle({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View className="min-h-14 flex-row items-center justify-between gap-4">
      <Text className="flex-1 font-medium">{label}</Text>
      <Switch
        accessibilityLabel={label}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ true: "#00233D" }}
        value={value}
      />
    </View>
  );
}
const pageTitles: Record<Page, string> = {
  intro: "For You",
  interests: "Your interests",
  refine: "Make it more personal",
  feed: "For You",
  detail: "Opportunity details",
  saved: "Saved Opportunities",
  dna: "Your Opportunity DNA",
  preferences: "For You Preferences",
  notifications: "Notification Preferences",
  menu: "Recommendation feedback",
  report: "Report content",
  why: "Why you're seeing this",
  reminder: "Deadline reminder",
};

export function ForYouExperience({
  profile,
  onChange,
  guest,
  onCreateAccount,
  persistenceError,
}: Props) {
  const [history, setHistory] = useState<Page[]>([
    guest || profile.onboarded ? "feed" : "intro",
  ]);
  const page = history.at(-1) ?? "feed";
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [active, setActive] = useState<Opportunity | null>(null);
  const [filter, setFilter] = useState("all");
  const [draftInterests, setDraftInterests] = useState(profile.interests);
  const [draftPreferences, setDraftPreferences] = useState(profile.preferences);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = setInterval(refresh, 60_000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refresh();
      }
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);
  const go = (next: Page) => {
    setMessage("");
    setHistory((previous) => [...previous, next]);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const back = () => {
    setMessage("");
    setHistory((previous) =>
      previous.length > 1 ? previous.slice(0, -1) : previous
    );
  };
  useEffect(() => {
    if (Platform.OS !== "android" || history.length <= 1) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setHistory((previous) => previous.slice(0, -1));
        return true;
      }
    );
    return () => subscription.remove();
  }, [history.length]);
  // Navigation changes the page; reset the viewport for both forward and back transitions.
  useEffect(() => {
    if (page) {
      scroll.current?.scrollTo({ y: 0, animated: false });
    }
  }, [page]);
  const sections = useMemo(
    () => buildFeed(opportunities, profile, guest, filter, now),
    [profile, guest, filter, now]
  );
  const savedItems = opportunities.filter((item) =>
    profile.saved.includes(item.id)
  );
  const selectedInterests = interests.filter((interest) =>
    profile.interests.includes(interest.id)
  );
  const edit = () => {
    setDraftInterests(profile.interests);
    setDraftPreferences(profile.preferences);
    go("interests");
  };
  const finish = (skip: boolean) => {
    const preferences = Object.fromEntries(
      draftInterests.map((id) => [id, skip ? [] : (draftPreferences[id] ?? [])])
    );
    onChange({
      ...profile,
      onboarded: true,
      interests: draftInterests,
      preferences,
    });
    setFilter("all");
    setHistory(["feed"]);
  };
  const save = (item: Opportunity) => {
    if (guest) {
      onCreateAccount();
      return;
    }
    const saved = profile.saved.includes(item.id);
    const reminders = { ...profile.reminders };
    if (saved) {
      delete reminders[item.id];
    }
    onChange({
      ...updateSignal(profile, item, saved ? -2 : 2),
      saved: saved
        ? profile.saved.filter((id) => id !== item.id)
        : [...profile.saved, item.id],
      reminders,
    });
    setMessage(
      saved
        ? "Removed from saved opportunities."
        : "Saved. Find it in Saved Opportunities."
    );
  };
  const open = (item: Opportunity, next: Page) => {
    setActive(item);
    if (!guest && next === "detail") {
      onChange(updateSignal(profile, item, 1));
    }
    go(next);
  };
  const share = async (item: Opportunity) => {
    try {
      const result = await Share.share({
        title: item.title,
        message: `${item.title}\nFictional NewsSpend example. Explore the provider: ${item.sourceUrl}`,
      });
      if (result.action === Share.sharedAction && !guest) {
        onChange(updateSignal(profile, item, 2));
      }
    } catch {
      setMessage("Unable to share. Please try again.");
    }
  };
  const visit = async (item: Opportunity) => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await WebBrowser.openBrowserAsync(item.sourceUrl);
    } catch {
      setMessage("Unable to open the source. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const feedback = (value: "more" | "less" | "dismiss") => {
    if (!active) {
      return;
    }
    if (guest) {
      onCreateAccount();
      return;
    }
    onChange({
      ...updateSignal(profile, active, value === "more" ? 3 : -3),
      feedback: { ...profile.feedback, [active.id]: value },
    });
    setHistory(["feed"]);
    setMessage(
      value === "more"
        ? "We'll show you more like this."
        : "Thanks. We'll adjust your recommendations."
    );
  };
  const renderCard = (item: Opportunity) => {
    const saved = !guest && profile.saved.includes(item.id);
    return (
      <Panel key={item.id}>
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-1 font-semibold text-muted">
            {interestTitle(item.category)} ·{" "}
            {item.kind === "news" ? "Update" : "Opportunity"}
          </Text>
          <Pressable
            accessibilityLabel={`More options for ${item.title}`}
            accessibilityRole="button"
            className="min-h-12 min-w-12 items-center justify-center"
            onPress={() => open(item, "menu")}
          >
            <DotsThreeVerticalIcon color="#587080" size={22} />
          </Pressable>
        </View>
        <Pressable
          accessibilityLabel={`View ${item.title}`}
          accessibilityRole="button"
          className="gap-2"
          onPress={() => open(item, "detail")}
        >
          <Heading>{item.title}</Heading>
          <Text className="text-muted">{item.location}</Text>
          <Text>{item.summary}</Text>
        </Pressable>
        {deadlineLabel(item) ? (
          <Text
            className={
              isClosed(item)
                ? "font-semibold text-muted"
                : "font-semibold text-foreground"
            }
          >
            {deadlineLabel(item)}
          </Text>
        ) : null}
        <Pressable
          accessibilityLabel={`Why you're seeing ${item.title}`}
          accessibilityRole="button"
          className="min-h-12 justify-center"
          onPress={() => open(item, "why")}
        >
          <Text className="text-muted">
            {recommendationReason(item, profile, guest)} ⓘ
          </Text>
        </Pressable>
        <View className="flex-row flex-wrap items-center gap-2">
          <Action
            label={item.kind === "news" ? "Read more" : "View"}
            onPress={() => open(item, "detail")}
            primary
          />
          <Action label={saved ? "Saved" : "Save"} onPress={() => save(item)}>
            <BookmarkSimpleIcon
              color="#587080"
              size={18}
              weight={saved ? "fill" : "regular"}
            />
          </Action>
          <Pressable
            accessibilityLabel={`Share ${item.title}`}
            accessibilityRole="button"
            className="min-h-12 min-w-12 items-center justify-center"
            onPress={() => {
              share(item);
            }}
          >
            <ShareIcon color="#587080" size={22} />
          </Pressable>
        </View>
      </Panel>
    );
  };
  const notificationSetting = (
    key: keyof Profile["notifications"],
    value: boolean
  ) =>
    onChange({
      ...profile,
      notifications: { ...profile.notifications, [key]: value },
    });
  return (
    <View className="flex-1 bg-background">
      <View className="gap-2 bg-p-500 px-4 pt-safe-offset-3 pb-4">
        <View className="flex-row items-center gap-3">
          {history.length > 1 ? (
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              className="min-h-12 min-w-12 justify-center"
              onPress={back}
            >
              <Text className="font-semibold text-white">‹ Back</Text>
            </Pressable>
          ) : (
            <SparkleIcon color="#E0BB7E" size={26} />
          )}
          <Text
            accessibilityRole="header"
            className="flex-1 text-white"
            variant="HeadingLarge"
          >
            {pageTitles[page]}
          </Text>
        </View>
        {page === "feed" ? (
          <Text className="text-white">
            {guest || !profile.personalized
              ? "Discover something useful today"
              : "Picked for you based on your interests"}
          </Text>
        ) : null}
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 130 }}
        ref={scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-muted text-xs">
          Preview · Fictional examples. Preferences, saves, reports and reminder
          choices stay on this device. Alerts are simulated.
        </Text>
        {persistenceError ? (
          <Text accessibilityRole="alert" className="text-danger">
            Unable to save your changes on this device. Please try again.
          </Text>
        ) : null}
        {message ? (
          <Text
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            className="rounded-xl bg-surface p-4 font-medium"
          >
            {message}
          </Text>
        ) : null}
        {page === "intro" ? (
          <>
            <Panel>
              <SparkleIcon color="#B39155" size={40} />
              <Heading>Useful discoveries. Picked for you.</Heading>
              <Text>
                Find opportunities, news and ideas that matter to you, with room
                for something unexpected.
              </Text>
              <Text>
                Choose your interests. Refine them if you like. Discover, save
                and explore the original source.
              </Text>
              <Action label="Choose my interests" onPress={edit} primary />
            </Panel>
            <Action
              label="Explore without personalizing"
              onPress={() => {
                onChange({ ...profile, onboarded: true, personalized: false });
                setHistory(["feed"]);
              }}
            />
            <Action
              label="Try the sample profile"
              onPress={() => {
                onChange(demoProfile());
                setHistory(["feed"]);
              }}
            />
          </>
        ) : null}
        {page === "interests" ? (
          <>
            <Heading>What are you interested in?</Heading>
            <Text>
              Choose what matters to you and we'll personalize your For You
              feed.
            </Text>
            <View className="gap-2">
              {interests.map((interest) => (
                <Action
                  key={interest.id}
                  label={interest.title}
                  onPress={() =>
                    setDraftInterests((previous) =>
                      previous.includes(interest.id)
                        ? previous.filter((id) => id !== interest.id)
                        : [...previous, interest.id]
                    )
                  }
                  selected={draftInterests.includes(interest.id)}
                />
              ))}
            </View>
            <Action
              label="Continue"
              onPress={() =>
                draftInterests.length
                  ? go("refine")
                  : setMessage("Choose at least one interest to continue.")
              }
              primary
            />
          </>
        ) : null}
        {page === "refine" ? (
          <>
            <Heading>A little more you. Entirely optional.</Heading>
            <Text>
              Refine the interests you selected, or skip to your feed.
            </Text>
            {interests
              .filter(
                (interest) =>
                  draftInterests.includes(interest.id) &&
                  interest.preferences.length
              )
              .map((interest) => (
                <Panel key={interest.id}>
                  <Heading>{interest.title}</Heading>
                  <Text>
                    {interest.question ?? "What interests you most?"}
                    {interest.limit ? ` Choose up to ${interest.limit}.` : ""}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {interest.preferences.map((preference) => (
                      <Action
                        key={preference}
                        label={preference}
                        onPress={() => {
                          const current = draftPreferences[interest.id] ?? [];
                          if (
                            !current.includes(preference) &&
                            interest.limit &&
                            current.length >= interest.limit
                          ) {
                            setMessage(
                              `Choose up to ${interest.limit} areas for ${interest.title}.`
                            );
                            return;
                          }
                          setDraftPreferences((previous) => ({
                            ...previous,
                            [interest.id]: current.includes(preference)
                              ? current.filter((value) => value !== preference)
                              : [...current, preference],
                          }));
                        }}
                        selected={
                          draftPreferences[interest.id]?.includes(preference) ??
                          false
                        }
                      />
                    ))}
                  </View>
                </Panel>
              ))}
            <Action label="Continue" onPress={() => finish(false)} primary />
            <Action label="Skip refinement" onPress={() => finish(true)} />
          </>
        ) : null}
        {page === "feed" ? (
          <>
            {guest ? (
              <Panel>
                <Heading>Make For You yours</Heading>
                <Text>
                  Create an account and choose your interests to get
                  personalized opportunities.
                </Text>
                <Action
                  label="Create account"
                  onPress={onCreateAccount}
                  primary
                />
              </Panel>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                <Action
                  label="Saved Opportunities"
                  onPress={() => go("saved")}
                />
                <Action label="Opportunity DNA" onPress={() => go("dna")} />
                <Action label="Preferences" onPress={() => go("preferences")} />
              </View>
            )}
            <ScrollView
              contentContainerStyle={{ gap: 8 }}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <Action
                label="All"
                onPress={() => setFilter("all")}
                selected={filter === "all"}
              />
              {(guest ? interests : selectedInterests).map((interest) => (
                <Action
                  key={interest.id}
                  label={interest.shortTitle}
                  onPress={() => setFilter(interest.id)}
                  selected={filter === interest.id}
                />
              ))}
            </ScrollView>
            {guest ? (
              <Heading>Popular Categories</Heading>
            ) : (
              <Action label="Edit interests" onPress={edit} />
            )}
            {sections.length === 0 ||
            (!guest &&
              profile.personalized &&
              sections.every(
                (section) => section.title === "Explore Something New"
              )) ? (
              <Panel>
                <Heading>We're finding more for you</Heading>
                <Text>
                  Explore recent and trending opportunities while we find more
                  that match your interests.
                </Text>
                <Action
                  label="Explore all opportunities"
                  onPress={() => setFilter("all")}
                />
              </Panel>
            ) : null}
            {sections.map((section) => (
              <View className="gap-3" key={section.title}>
                <Heading>{section.title}</Heading>
                {section.data.map(renderCard)}
              </View>
            ))}
            {sections.length
              ? null
              : buildFeed(
                  opportunities,
                  { ...profile, personalized: false },
                  guest
                ).map((section) => (
                  <View className="gap-3" key={section.title}>
                    <Heading>{section.title}</Heading>
                    {section.data.slice(0, 3).map(renderCard)}
                  </View>
                ))}
          </>
        ) : null}
        {page === "detail" && active ? (
          <>
            <Panel>
              <Text className="font-semibold text-muted">
                {interestTitle(active.category)}
              </Text>
              <Text variant="title">{active.title}</Text>
              <Text>{active.provider}</Text>
              <Text>{active.location}</Text>
              <Text>
                Published {new Date(active.publishedAt).toLocaleDateString()}
              </Text>
              {deadlineLabel(active) ? (
                <Text className="font-semibold">{deadlineLabel(active)}</Text>
              ) : null}
            </Panel>
            <Heading>Overview</Heading>
            <Text>{active.overview}</Text>
            <Panel>
              <Heading>Key Details</Heading>
              {Object.entries(active.details).map(([key, value]) => (
                <View className="gap-1" key={key}>
                  <Text className="text-muted">{key}</Text>
                  <Text className="font-medium">{value}</Text>
                </View>
              ))}
            </Panel>
            <Panel>
              <Heading>
                {active.sourceType === "official"
                  ? "Official Source"
                  : "Verified Source"}
              </Heading>
              <Text>{new URL(active.sourceUrl).hostname}</Text>
              <Text>
                The link opens an external provider website. This fictional
                example is not a confirmed listing.
              </Text>
              <Action
                label={busy ? "Opening source…" : "Visit official source ↗"}
                onPress={() => {
                  visit(active);
                }}
                primary
              />
            </Panel>
            <Action
              label={
                profile.saved.includes(active.id) && !guest
                  ? "Saved"
                  : "Save opportunity"
              }
              onPress={() => save(active)}
            />
            <Action
              label="Share opportunity"
              onPress={() => {
                share(active);
              }}
            />
            <Action label="Why you're seeing this" onPress={() => go("why")} />
            {!guest &&
            profile.saved.includes(active.id) &&
            active.deadline &&
            !isClosed(active) ? (
              <Action
                label={
                  profile.reminders[active.id]
                    ? `Reminder: ${profile.reminders[active.id]} days before`
                    : "Remind me"
                }
                onPress={() => go("reminder")}
              />
            ) : null}
          </>
        ) : null}
        {page === "saved" ? (
          savedItems.length ? (
            savedItems.map(renderCard)
          ) : (
            <Panel>
              <Heading>Keep useful discoveries close</Heading>
              <Text>
                Save an opportunity to return to it here. Closed opportunities
                stay in your saved list with a clear label.
              </Text>
              <Action
                label="Explore opportunities"
                onPress={() => setHistory(["feed"])}
              />
            </Panel>
          )
        ) : null}
        {page === "why" && active ? (
          <Panel>
            <Heading>Why you're seeing this</Heading>
            <Text>{recommendationReason(active, profile, guest)}.</Text>
            <Text>
              We consider your choices, recent content and trusted sources,
              while leaving room for new discoveries.
            </Text>
            {guest ? null : (
              <Action
                label="Manage personalization"
                onPress={() => go("preferences")}
              />
            )}
          </Panel>
        ) : null}
        {page === "menu" && active ? (
          <>
            <Heading>{active.title}</Heading>
            <Action
              label="Show me more like this"
              onPress={() => feedback("more")}
            />
            <Action
              label="Show me less like this"
              onPress={() => feedback("less")}
            />
            <Action
              label="Not interested"
              onPress={() => feedback("dismiss")}
            />
            <Action label="Why you're seeing this" onPress={() => go("why")} />
            <Action label="Report" onPress={() => go("report")} />
          </>
        ) : null}
        {page === "report" && active ? (
          <>
            <Heading>What should we review?</Heading>
            <Text>
              Reports in this preview are stored on this device. They are not
              submitted to a moderation team.
            </Text>
            {reportReasons.map((reason) => (
              <Action
                key={reason}
                label={reason}
                onPress={() => {
                  if (guest) {
                    onCreateAccount();
                    return;
                  }
                  onChange({
                    ...profile,
                    reports: [
                      ...profile.reports,
                      {
                        opportunityId: active.id,
                        reason,
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  });
                  back();
                  setMessage(
                    "Thanks. Your report was recorded for this preview."
                  );
                }}
              />
            ))}
          </>
        ) : null}
        {page === "reminder" && active ? (
          <>
            <Heading>Remind me before the deadline</Heading>
            <Text>{deadlineLabel(active)}</Text>
            <Text>
              Choose a reminder for this preview. No notification will be
              scheduled.
            </Text>
            {[1, 3, 7].map((days) => (
              <Action
                key={days}
                label={`${days} ${days === 1 ? "day" : "days"} before`}
                onPress={() => {
                  if (
                    !active.deadline ||
                    isClosed(active) ||
                    !profile.saved.includes(active.id)
                  ) {
                    setMessage(
                      "Save an open opportunity with a deadline first."
                    );
                    return;
                  }
                  if (
                    Date.parse(active.deadline) - days * 86_400_000 <=
                    Date.now()
                  ) {
                    setMessage(
                      "That reminder date has passed. Choose a closer reminder."
                    );
                    return;
                  }
                  onChange({
                    ...profile,
                    reminders: {
                      ...profile.reminders,
                      [active.id]: days as 1 | 3 | 7,
                    },
                  });
                  setMessage("Reminder choice saved for this preview.");
                }}
                selected={profile.reminders[active.id] === days}
              />
            ))}
            {profile.reminders[active.id] ? (
              <Action
                label="Remove reminder"
                onPress={() => {
                  const reminders = { ...profile.reminders };
                  delete reminders[active.id];
                  onChange({ ...profile, reminders });
                  setMessage("Reminder removed.");
                }}
              />
            ) : null}
            {profile.notifications.paused ||
            !profile.notifications.deadlines ? (
              <Text>
                Deadline notifications are turned off in your preferences.
              </Text>
            ) : null}
          </>
        ) : null}
        {page === "dna" ? (
          <>
            <Text>
              This helps NewsSpend understand what opportunities matter to you.
            </Text>
            <Panel>
              <Heading>Your Interests</Heading>
              {selectedInterests.length ? (
                selectedInterests.map((interest) => (
                  <View className="gap-1" key={interest.id}>
                    <Text className="font-semibold">{interest.title}</Text>
                    {profile.preferences[interest.id]?.length ? (
                      <Text className="text-muted">
                        {profile.preferences[interest.id]?.join(" · ")}
                      </Text>
                    ) : null}
                  </View>
                ))
              ) : (
                <Text>Choose interests to make For You yours.</Text>
              )}
            </Panel>
            <Panel>
              <Heading>What NewsSpend is Learning</Heading>
              {profile.personalized ? (
                Object.entries(profile.signals).some(
                  ([, score]) => score > 0
                ) ? (
                  Object.entries(profile.signals)
                    .filter(([, score]) => score > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([id]) => <Text key={id}>{interestTitle(id)}</Text>)
                ) : (
                  <Text>
                    As you open, save and share discoveries, your interests will
                    appear here. Your chosen interests stay yours.
                  </Text>
                )
              ) : (
                <Text>Learning from your activity is paused.</Text>
              )}
            </Panel>
            <Action label="Edit interests" onPress={edit} />
            <Action
              label="Manage personalization"
              onPress={() => go("preferences")}
            />
          </>
        ) : null}
        {page === "preferences" ? (
          <>
            <Panel>
              <Action label="Edit interests" onPress={edit} />
              <Action
                label="Manage Opportunity DNA"
                onPress={() => go("dna")}
              />
              <Action
                label="Notification Preferences"
                onPress={() => go("notifications")}
              />
            </Panel>
            <Panel>
              <Toggle
                label="Personalized recommendations"
                onChange={(value) =>
                  onChange({ ...profile, personalized: value })
                }
                value={profile.personalized}
              />
              <Text>
                When enabled, your activity helps personalize discoveries. Turn
                this off to browse recent and trending content without using or
                recording inferred interests.
              </Text>
            </Panel>
            <Action
              label="Reset learned activity"
              onPress={() => {
                onChange({ ...profile, signals: {}, feedback: {} });
                setMessage(
                  "Learned activity cleared. Your selected interests are unchanged."
                );
              }}
            />
          </>
        ) : null}
        {page === "notifications" ? (
          <>
            <Text>
              Choose which discovery alerts you would like to receive. These
              choices are saved locally for this preview; delivery is simulated.
            </Text>
            <Panel>
              <Toggle
                label="Pause all For You notifications"
                onChange={(value) => notificationSetting("paused", value)}
                value={profile.notifications.paused}
              />
              <Toggle
                disabled={profile.notifications.paused}
                label="New opportunities"
                onChange={(value) =>
                  notificationSetting("newOpportunities", value)
                }
                value={profile.notifications.newOpportunities}
              />
              <Toggle
                disabled={profile.notifications.paused}
                label="Discovery suggestions"
                onChange={(value) => notificationSetting("discovery", value)}
                value={profile.notifications.discovery}
              />
              <Toggle
                disabled={profile.notifications.paused}
                label="Deadline reminders"
                onChange={(value) => notificationSetting("deadlines", value)}
                value={profile.notifications.deadlines}
              />
            </Panel>
            <Action
              label="Preview an alert"
              onPress={() => {
                if (profile.notifications.paused) {
                  setMessage(
                    "Notifications are paused. Resume them to preview an alert."
                  );
                  return;
                }
                const reminder = Object.entries(profile.reminders).find(
                  ([id]) =>
                    opportunities.some(
                      (item) => item.id === id && !isClosed(item)
                    )
                );
                setMessage(
                  profile.notifications.deadlines && reminder
                    ? "Deadline approaching · An opportunity you saved has an upcoming deadline."
                    : profile.notifications.newOpportunities
                      ? "Something new for you · A new opportunity related to your interests was added."
                      : profile.notifications.discovery
                        ? "You may be interested in this · Explore something outside your usual interests."
                        : "All notification types are turned off."
                );
              }}
            />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
