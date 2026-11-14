import { type Opportunity, opportunities } from "../catalog";
import {
  buildFeed,
  createProfile,
  deadlineLabel,
  demoProfile,
  isClosed,
  recommendationReason,
  updateSignal,
} from "../model";

const now = Date.parse("2026-11-14T12:00:00Z");
const first = opportunities[0];
if (!first) {
  throw new Error("The fixture catalog must contain opportunities");
}
const flat = (profile = demoProfile(), guest = false) =>
  buildFeed(opportunities, profile, guest, "all", now).flatMap(
    (section) => section.data
  );

describe("For You recommendations", () => {
  it("removes expired opportunities, consolidates duplicates and prefers official sources", () => {
    const duplicate: Opportunity = {
      ...first,
      id: "copy",
      sourceType: "verified",
    };
    const result = buildFeed(
      [duplicate, ...opportunities],
      demoProfile(),
      false,
      "all",
      now
    ).flatMap((section) => section.data);
    expect(
      result.filter((item) => item.canonicalId === first.canonicalId)
    ).toEqual([first]);
    expect(result.some((item) => isClosed(item, now))).toBe(false);
    expect(new Set(result.map((item) => item.canonicalId)).size).toBe(
      result.length
    );
  });
  it("retains explicit interests and blends approximately 80/20 discovery", () => {
    const profile = demoProfile();
    const result = flat(profile);
    const discovery = result.filter(
      (item) => !profile.interests.includes(item.category)
    );
    expect(discovery.length / result.length).toBeGreaterThanOrEqual(0.15);
    expect(discovery.length / result.length).toBeLessThanOrEqual(0.3);
    expect(profile.interests).toEqual(["jobs", "technology", "immigration"]);
    expect(new Set(result.map((item) => item.category)).size).toBeGreaterThan(
      2
    );
  });
  it("filters categories and applies dismissals without hiding saved records from the catalog", () => {
    const profile = demoProfile();
    profile.feedback[first.id] = "dismiss";
    profile.saved = [first.id];
    expect(flat(profile).some((item) => item.id === first.id)).toBe(false);
    expect(opportunities.find((item) => profile.saved.includes(item.id))).toBe(
      first
    );
    expect(
      buildFeed(opportunities, demoProfile(), false, "immigration", now)
        .flatMap((section) => section.data)
        .every((item) => item.category === "immigration")
    ).toBe(true);
  });
  it("stops using and collecting inferred signals when personalization is disabled", () => {
    const profile = { ...demoProfile(), personalized: false };
    expect(updateSignal(profile, first, 4)).toBe(profile);
    expect(flat(profile).map((item) => item.id)).toEqual(
      flat({ ...createProfile(), personalized: false }).map((item) => item.id)
    );
    expect(recommendationReason(first, profile, false)).toBe(
      "Recent and trending opportunities"
    );
  });
  it("does not give guests a personalized feed", () => {
    expect(flat(demoProfile(), true).map((item) => item.id)).toEqual(
      flat(createProfile(), true).map((item) => item.id)
    );
    expect(recommendationReason(first, demoProfile(), true)).toBe(
      "Recent and trending opportunities"
    );
  });
  it("learns gradually, caps behavior influence, and preserves explicit interests", () => {
    const profile = demoProfile();
    const updated = updateSignal(profile, first, 100);
    expect(updated.signals.jobs).toBe(10);
    expect(updated.interests).toEqual(profile.interests);
    expect(recommendationReason(first, profile, false)).toContain(
      "IT & Digital"
    );
  });
  it("only shows sections when relevant content is available", () => {
    expect(buildFeed([], demoProfile(), false, "all", now)).toEqual([]);
    expect(
      buildFeed([first], demoProfile(), false, "all", now).map(
        (section) => section.title
      )
    ).not.toContain("Closing Soon");
  });
  it("never invents deadlines and identifies closed and soon-closing content", () => {
    expect(deadlineLabel({ ...first, deadline: undefined }, now)).toBeNull();
    expect(
      deadlineLabel({ ...first, deadline: "2026-11-15T10:00:00Z" }, now)
    ).toBe("Closes tomorrow");
    expect(
      deadlineLabel({ ...first, deadline: "2026-11-13T10:00:00Z" }, now)
    ).toContain("Closed");
  });
});
