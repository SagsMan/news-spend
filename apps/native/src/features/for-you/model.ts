import { interests, type Opportunity } from "./catalog";

export type Feedback = "more" | "less" | "dismiss";
export type Profile = {
  onboarded: boolean;
  interests: string[];
  preferences: Record<string, string[]>;
  personalized: boolean;
  saved: string[];
  signals: Record<string, number>;
  feedback: Record<string, Feedback>;
  reminders: Record<string, 1 | 3 | 7>;
  reports: { opportunityId: string; reason: string; createdAt: string }[];
  notifications: {
    newOpportunities: boolean;
    discovery: boolean;
    deadlines: boolean;
    paused: boolean;
  };
};
export const createProfile = (): Profile => ({
  onboarded: false,
  interests: [],
  preferences: {},
  personalized: true,
  saved: [],
  signals: {},
  feedback: {},
  reminders: {},
  reports: [],
  notifications: {
    newOpportunities: true,
    discovery: true,
    deadlines: true,
    paused: false,
  },
});
export const demoProfile = (): Profile => ({
  ...createProfile(),
  onboarded: true,
  interests: ["jobs", "technology", "immigration"],
  preferences: {
    jobs: [
      "IT & Digital",
      "Business & Governance",
      "Customer & Technical Support",
    ],
    technology: ["AI & Data", "Software & Cloud"],
    immigration: ["Canada", "United Kingdom"],
  },
  signals: { education: 3 },
});
export const isClosed = (item: Opportunity, now = Date.now()) =>
  !!item.deadline && Date.parse(item.deadline) <= now;
export function deadlineLabel(item: Opportunity, now = Date.now()) {
  if (!item.deadline) {
    return null;
  }
  const days = Math.ceil((Date.parse(item.deadline) - now) / 86_400_000);
  if (days <= 0) {
    return "Closed · Deadline passed";
  }
  if (days === 1) {
    return "Closes tomorrow";
  }
  if (days <= 7) {
    return `Closes in ${days} days`;
  }
  return `Deadline: ${new Date(item.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}
export const updateSignal = (
  profile: Profile,
  item: Opportunity,
  weight: number
): Profile =>
  profile.personalized
    ? {
        ...profile,
        signals: {
          ...profile.signals,
          [item.category]: Math.max(
            -10,
            Math.min(10, (profile.signals[item.category] ?? 0) + weight)
          ),
        },
      }
    : profile;
export function recommendationReason(
  item: Opportunity,
  profile: Profile,
  guest: boolean
) {
  if (guest || !profile.personalized) {
    return "Recent and trending opportunities";
  }
  const selected = profile.interests.includes(item.category);
  const preference = profile.preferences[item.category]?.find((tag) =>
    item.tags.includes(tag)
  );
  if (selected && preference) {
    return `Because you're interested in ${preference}`;
  }
  if (selected) {
    return `Based on your interest in ${interests.find((i) => i.id === item.category)?.title ?? item.category}`;
  }
  if ((profile.signals[item.category] ?? 0) > 0) {
    return "Related to opportunities you engage with";
  }
  return "Explore something new outside your usual interests";
}
export type FeedSection = { title: string; data: Opportunity[] };
export function buildFeed(
  items: Opportunity[],
  profile: Profile,
  guest: boolean,
  filter = "all",
  now = Date.now()
): FeedSection[] {
  const unique = new Map<string, Opportunity>();
  for (const item of items) {
    if (
      isClosed(item, now) ||
      (!guest && profile.feedback[item.id] === "dismiss")
    ) {
      continue;
    }
    const previous = unique.get(item.canonicalId);
    if (
      !previous ||
      (previous.sourceType !== "official" && item.sourceType === "official")
    ) {
      unique.set(item.canonicalId, item);
    }
  }
  const personalization = !guest && profile.personalized;
  const score = (item: Opportunity) =>
    (personalization
      ? (profile.interests.includes(item.category) ? 60 : 0) +
        (profile.preferences[item.category]?.filter((tag) =>
          item.tags.includes(tag)
        ).length ?? 0) *
          8 +
        (profile.signals[item.category] ?? 0) * 2 +
        (profile.feedback[item.id] === "more"
          ? 15
          : profile.feedback[item.id] === "less"
            ? -50
            : 0)
      : 0) +
    (item.sourceType === "official" ? 10 : 5) +
    item.trending / 10 +
    Math.max(0, 10 - (now - Date.parse(item.publishedAt)) / 86_400_000);
  const ranked = [...unique.values()]
    .filter((item) => filter === "all" || item.category === filter)
    .sort((a, b) => score(b) - score(a));
  if (filter !== "all") {
    return ranked.length
      ? [{ title: "Picked for this interest", data: ranked }]
      : [];
  }
  if (!(personalization && profile.interests.length)) {
    return [
      {
        title: "Trending Opportunities",
        data: [...ranked].sort((a, b) => b.trending - a.trending).slice(0, 4),
      },
      {
        title: "Latest Opportunities",
        data: ranked
          .filter(
            (item) =>
              ![...ranked]
                .sort((a, b) => b.trending - a.trending)
                .slice(0, 4)
                .includes(item)
          )
          .sort(
            (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
          ),
      },
    ].filter((section) => section.data.length);
  }
  // A weighted discovery budget, rather than a repeating eight-plus-two pattern.
  const matched = ranked.filter((item) =>
    profile.interests.includes(item.category)
  );
  const discovery = ranked
    .filter((item) => !profile.interests.includes(item.category))
    .slice(0, Math.max(1, Math.round(matched.length / 4)));
  const used = new Set<string>();
  const take = (candidates: Opportunity[], count: number) => {
    const result: Opportunity[] = [];
    for (const item of candidates) {
      if (used.has(item.id)) {
        continue;
      }
      if (
        result.filter((previous) => previous.category === item.category)
          .length >= 2 &&
        candidates.some(
          (other) => !used.has(other.id) && other.category !== item.category
        )
      ) {
        continue;
      }
      result.push(item);
      used.add(item.id);
      if (result.length >= count) {
        break;
      }
    }
    return result;
  };
  const closing = matched
    .filter(
      (item) =>
        item.deadline && Date.parse(item.deadline) - now <= 7 * 86_400_000
    )
    .sort(
      (a, b) => Date.parse(a.deadline ?? "") - Date.parse(b.deadline ?? "")
    );
  const closingData = take(closing, 2);
  const recommended = take(matched, 4);
  const recent = take(
    [...matched].sort(
      (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
    ),
    3
  );
  const trending = take(matched, matched.length);
  return [
    { title: "Recommended for You", data: recommended },
    { title: "New Opportunities", data: recent },
    { title: "Closing Soon", data: closingData },
    { title: "Explore Something New", data: discovery },
    { title: "Trending", data: trending },
  ].filter((section) => section.data.length);
}
