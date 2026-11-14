import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useMMKVObject } from "react-native-mmkv";
import { useSnapshot } from "valtio";
import { z } from "zod";
import { authState } from "#/state/auth";
import { ForYouExperience } from "./ForYouExperience";
import { createProfile, type Profile } from "./model";

const profileSchema = z.object({
  onboarded: z.boolean(),
  interests: z.array(z.string()),
  preferences: z.record(z.string(), z.array(z.string())),
  personalized: z.boolean(),
  saved: z.array(z.string()),
  signals: z.record(z.string(), z.number()),
  feedback: z.record(z.string(), z.enum(["more", "less", "dismiss"])),
  reminders: z.record(
    z.string(),
    z.union([z.literal(1), z.literal(3), z.literal(7)])
  ),
  reports: z.array(
    z.object({
      opportunityId: z.string(),
      reason: z.string(),
      createdAt: z.string(),
    })
  ),
  notifications: z.object({
    newOpportunities: z.boolean(),
    discovery: z.boolean(),
    deadlines: z.boolean(),
    paused: z.boolean(),
  }),
});
function AccountExperience({
  accountId,
  guest,
}: {
  accountId: string;
  guest: boolean;
}) {
  const navigation = useNavigation();
  const [stored, setStored] = useMMKVObject<Profile>(`FOR_YOU_V1:${accountId}`);
  const [persistenceError, setPersistenceError] = useState(false);
  const parsed = profileSchema.safeParse(stored);
  const profile = parsed.success ? parsed.data : createProfile();
  return (
    <ForYouExperience
      guest={guest}
      onChange={(next) => {
        if (guest) {
          return;
        }
        try {
          setStored(next);
          setPersistenceError(false);
        } catch {
          setPersistenceError(true);
        }
      }}
      onCreateAccount={() => navigation.navigate("SignUp")}
      persistenceError={persistenceError}
      profile={profile}
    />
  );
}
export default function ForYouScreen() {
  const { user } = useSnapshot(authState);
  const guest = !user || user.isAnonymous === true;
  return (
    <AccountExperience
      accountId={user?.id ?? "guest"}
      guest={guest}
      key={user?.id ?? "guest"}
    />
  );
}
