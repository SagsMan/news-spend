<!-- coderabbit-ai-generated:v1 -->

# For You

## Scope

Implements the consumer app prototype in sections 1–55 of the supplied For You document. The primary category list contains 13 interests, including Comedy, Communication and AI. The later, contradictory application tracking and personalized search epics are excluded to preserve sections 29, 45 and 53.

The permanent navigation is Home → Live → For You → Discover → Me. Shop remains available from Me and through its existing link. Live shows an availability state because the existing News collection disables video.

## Included flows

- Introduction, interest selection, optional category-specific refinements, and a fictional sample profile.
- Personalized and category feeds, recommendation explanations, discovery content, and limited-content fallback.
- Content details with type-specific fields and external official provider links.
- Save/remove, saved closed opportunities, sharing, and deadline reminder choices.
- More/less/not interested feedback, local reports, Opportunity DNA, editing interests, personalization controls and notification preferences.
- Guest browsing and account creation entry points.

The ranking model excludes expired content, consolidates duplicates with preference for official sources, uses explicit choices and bounded behavior signals, and budgets approximately 20% discovery when enough content is available. Disabling personalization stops collecting and using behavior signals; resetting learned activity preserves explicit interests.

## Prototype data and persistence

All catalog entries and providers are explicitly fictional. Dates are fixed rather than renewed at every launch. External links point to public provider information, not fabricated application pages. Opportunity source labels demonstrate the design and do not constitute verification of the fictional listings.

Profiles are validated and stored with MMKV under a versioned account-specific key. They do not sync between devices. Reports, reminder choices and notification preferences are stored locally; report submission and notification delivery are simulated. No live source ingestion, source discovery, AI service or moderation backend is implemented. Replace the catalog with a CMS-backed service and add those integrations before a production launch.

## Browser preview

From `apps/native`, run `bun run web -- --port 8081`, then open `/for-you-preview.html`. The existing Varlock schema requires Detour configuration at bundling time. For this isolated preview, synthetic, non-secret placeholders can be supplied to the process: `EXPO_PUBLIC_DETOUR_API_KEY=local-preview-placeholder EXPO_PUBLIC_DETOUR_APP_ID=local-preview-app bun run web -- --port 8081`. The preview does not initialize Detour, ads, authentication or API clients.

The preview renders the actual For You feature with New user, Sample profile and Guest controls. Its profile is in memory and resets on reload. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:aaeaa0cca717e90d476f144af9d2f97162508203e45a32651b1eda4f2fc6999b -->

Native tab navigation, account persistence and platform share/browser behavior still require device verification.

The web preview uses the workspace React/React DOM pair through a web-only Metro resolution rule, a text ancestor-context fallback for React Native Web, and a pinned Uniwind patch that avoids an InputAccessoryView barrel-import cycle. Existing dependency patches are preserved. Run `bun install --frozen-lockfile` at the root to apply the patch reproducibly.

<!-- /coderabbit-ai-generated:v1 -->

## Focused checks

Run `EXPO_PUBLIC_DETOUR_API_KEY=local-test-placeholder EXPO_PUBLIC_DETOUR_APP_ID=local-test-app bun run test -- --runInBand src/features/for-you/__tests__` from `apps/native`. No external API is called by these tests.
