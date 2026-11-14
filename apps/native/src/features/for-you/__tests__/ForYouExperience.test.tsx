import { fireEvent, render, screen } from "@testing-library/react-native";
import { useState } from "react";
import { ForYouExperience } from "../ForYouExperience";
import { createProfile, demoProfile, type Profile } from "../model";

jest.mock("expo-web-browser", () => ({ openBrowserAsync: jest.fn() }));
jest.mock("#/lib/icons", () => {
  const { View } = require("react-native");
  return {
    BookmarkSimpleIcon: View,
    DotsThreeVerticalIcon: View,
    ShareIcon: View,
    SparkleIcon: View,
  };
});
function Harness({
  initial = createProfile(),
  guest = false,
  onCreateAccount = jest.fn(),
}: {
  initial?: Profile;
  guest?: boolean;
  onCreateAccount?: () => void;
}) {
  const [profile, setProfile] = useState(initial);
  return (
    <ForYouExperience
      guest={guest}
      onChange={setProfile}
      onCreateAccount={onCreateAccount}
      profile={profile}
    />
  );
}
const press = async (name: string) =>
  fireEvent.press(screen.getByRole("button", { name }));

beforeEach(() => {
  jest.spyOn(Date, "now").mockReturnValue(Date.parse("2026-11-14T12:00:00Z"));
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe("For You journeys", () => {
  it("onboards with multiple interests and optional category-specific refinements", async () => {
    await render(<Harness />);
    await press("Choose my interests");
    expect(screen.getAllByRole("checkbox")).toHaveLength(13);
    await fireEvent.press(screen.getByRole("checkbox", { name: "Jobs" }));
    await fireEvent.press(
      screen.getByRole("checkbox", { name: "Immigration" })
    );
    await press("Continue");
    expect(screen.getByText("Which destinations interest you?")).toBeTruthy();
    expect(screen.queryByText("AI & Data")).toBeNull();
    await fireEvent.press(
      screen.getByRole("checkbox", { name: "IT & Digital" })
    );
    await fireEvent.press(screen.getByRole("checkbox", { name: "Canada" }));
    await press("Continue");
    expect(
      screen.getByText("Picked for you based on your interests")
    ).toBeTruthy();
    await press("Opportunity DNA");
    expect(screen.getByText("IT & Digital")).toBeTruthy();
    expect(screen.getByText("Canada")).toBeTruthy();
  });
  it("allows skipping refinements and changing interests later", async () => {
    await render(<Harness />);
    await press("Choose my interests");
    await fireEvent.press(screen.getByRole("checkbox", { name: "Technology" }));
    await press("Continue");
    await press("Skip refinement");
    await press("Edit interests");
    expect(
      screen.getByRole("checkbox", { name: "Technology" }).props
        .accessibilityState.checked
    ).toBe(true);
    await fireEvent.press(screen.getByRole("checkbox", { name: "AI" }));
    await press("Continue");
    await press("Continue");
    expect(screen.getByRole("checkbox", { name: "AI" })).toBeTruthy();
  });
  it("saves opportunities, records a deadline reminder and removes saved content", async () => {
    await render(<Harness initial={demoProfile()} />);
    await press("View Technical Support Specialist");
    await press("Save opportunity");
    await press("Remind me");
    await fireEvent.press(
      screen.getByRole("checkbox", { name: "3 days before" })
    );
    expect(
      screen.getByText("Reminder choice saved for this preview.")
    ).toBeTruthy();
    await press("Go back");
    await press("Go back");
    await press("Saved Opportunities");
    expect(screen.getByText("Technical Support Specialist")).toBeTruthy();
    await press("Saved");
    expect(screen.getByText("Keep useful discoveries close")).toBeTruthy();
  });
  it("lets guests browse while gating saves behind account creation", async () => {
    const signUp = jest.fn();
    await render(<Harness guest onCreateAccount={signUp} />);
    expect(screen.getByText("Make For You yours")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Opportunity DNA" })
    ).toBeNull();
    const saveButton = screen.getAllByRole("button", { name: "Save" })[0];
    if (!saveButton) {
      throw new Error("Expected a save action");
    }
    await fireEvent.press(saveButton);
    expect(signUp).toHaveBeenCalledTimes(1);
  });
  it("shows closed saved items while excluding them from active feeds", async () => {
    await render(
      <Harness initial={{ ...demoProfile(), saved: ["closed-scholarship"] }} />
    );
    expect(
      screen.queryByText("Previous Graduate Scholarship Round")
    ).toBeNull();
    await press("Saved Opportunities");
    expect(screen.getByText("Closed · Deadline passed")).toBeTruthy();
  });
  it("allows opting out and pausing all notification previews", async () => {
    await render(<Harness initial={demoProfile()} />);
    await press("Preferences");
    await fireEvent(
      screen.getByRole("switch", { name: "Personalized recommendations" }),
      "valueChange",
      false
    );
    await press("Notification Preferences");
    await fireEvent(
      screen.getByRole("switch", { name: "Pause all For You notifications" }),
      "valueChange",
      true
    );
    await press("Preview an alert");
    expect(
      screen.getByText(
        "Notifications are paused. Resume them to preview an alert."
      )
    ).toBeTruthy();
    await press("Go back");
    await press("Go back");
    expect(screen.getByText("Discover something useful today")).toBeTruthy();
    expect(screen.queryByText("Recommended for You")).toBeNull();
  });
  it("keeps dismissed opportunities out of the empty-feed fallback", async () => {
    const { opportunities } =
      require("../catalog") as typeof import("../catalog");
    const initial = demoProfile();
    initial.feedback = Object.fromEntries(
      opportunities.map((item) => [item.id, "dismiss" as const])
    );
    await render(<Harness initial={initial} />);
    expect(screen.getByText("We're finding more for you")).toBeTruthy();
    expect(screen.queryByText("Technical Support Specialist")).toBeNull();
  });
  it("records a local report and removes content after explicit negative feedback", async () => {
    await render(<Harness initial={demoProfile()} />);
    await press("More options for Technical Support Specialist");
    await press("Report");
    await press("Broken link");
    expect(
      screen.getByText("Thanks. Your report was recorded for this preview.")
    ).toBeTruthy();
    await press("Not interested");
    expect(screen.queryByText("Technical Support Specialist")).toBeNull();
  });
});
