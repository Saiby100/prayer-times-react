# Google Play Publishing Checklist

Local working checklist for getting **Reminder** (`com.salasaiet.reminder`) qualified for
production on Google Play. Not published anywhere — for personal tracking only.

Legend: `[ ]` todo · `[x]` done · `[~]` in progress / blocked-by-time

---

## 0. Account prerequisites

- [ ] Confirm account type — **personal** vs **organization**
      ([Play Console → Setup → Account details](https://play.google.com/console))
- [ ] Pay the **$25 one-time registration fee** (if not already)
- [ ] Complete **identity verification** (name / address / phone) — can take a few days
      · <https://support.google.com/googleplay/android-developer/answer/13628312>
- [ ] (Org accounts only) Obtain a **D-U-N-S number** · <https://support.google.com/googleplay/android-developer/answer/13628312>

## 1. Closed testing gate (the long pole — start FIRST if personal)

Personal accounts created after **Nov 2023** must run a closed test before applying for
production. This is a 14-day wall clock, so kick it off before anything else.

- [ ] Recruit **20+ testers** who stay opted in for **14 continuous days**
- [ ] Create a **Closed testing** track and add testers (email list or Google Group)
- [ ] Keep the test running 14 days, then **apply for production access**
      · <https://support.google.com/googleplay/android-developer/answer/14151465>

## 2. Build & signing (Expo / EAS)

- [ ] **FIX: switch production build to AAB.** `eas.json` currently has
      `production.android.buildType: "apk"` — Play requires an **App Bundle**.
      Remove that line (EAS defaults to `app-bundle`) or set `"buildType": "app-bundle"`
      · <https://docs.expo.dev/build-reference/apk/>
- [ ] Produce a production build:
      `eas build --platform android --profile production`
- [ ] Enroll in **Play App Signing** (let Google hold the signing key; EAS manages the upload key)
      · <https://docs.expo.dev/app-signing/app-credentials/>
- [ ] Confirm **`versionCode`** increments per release (auto-derived from semver in `app.config.ts`)
- [ ] Verify **target API level** meets Play's minimum for new apps (currently API 35)
      · <https://developer.android.com/google/play/requirements/target-sdk>
- [ ] (Optional) Configure `eas submit` for automated uploads
      · <https://docs.expo.dev/submit/android/>

## 3. Permissions justification

App requests these — each may need an in-console declaration:

- [ ] **`SCHEDULE_EXACT_ALARM`** — exact-alarm policy form (used for prayer reminders)
      · <https://support.google.com/googleplay/android-developer/answer/13161072>
- [ ] **`POST_NOTIFICATIONS`** (Android 13+, via expo-notifications) — covered in Data safety
- [ ] **Location** (`expo-location`, foreground only, for Qibla) — location permissions
      declaration + prominent-disclosure check
      · <https://support.google.com/googleplay/android-developer/answer/9799150>

## 4. Store listing assets

- [ ] App name, **short description** (≤80 chars), **full description** (≤4000 chars)
- [ ] **App icon** 512×512 PNG
- [ ] **Feature graphic** 1024×500
- [ ] **Phone screenshots** (2–8; add tablet if supporting — iOS config has `supportsTablet`)
- [ ] Category + tags, contact email
      · Specs: <https://support.google.com/googleplay/android-developer/answer/9866151>

## 5. Required declarations & policies

- [ ] **Privacy policy** — hosted URL required. Cover: notifications, local MMKV storage,
      location (Qibla), and network fetches to `masjids.co.za` / Supabase
      · <https://support.google.com/googleplay/android-developer/answer/10787469>
- [ ] **Data safety form** — declare data collection/sharing accurately
      · <https://support.google.com/googleplay/android-developer/answer/10787469>
- [ ] **Content rating** questionnaire · <https://support.google.com/googleplay/android-developer/answer/9859655>
- [ ] **Target audience & content** (age groups)
- [ ] **Ads** declaration → **No ads**
- [ ] **Government / news / financial / health** declarations → likely N/A
- [ ] **Data deletion** — if any account data (Supabase), provide a deletion path

## 6. Pre-launch checks

- [ ] Review **Pre-launch report** (Play runs the build on real devices for crashes)
      · <https://support.google.com/googleplay/android-developer/answer/9844487>
- [ ] Test **notifications**, **exact alarms**, and **Qibla/location** on a physical Android 13+ device
- [ ] Verify **deep links** / routing don't crash on cold start

## 7. Release

- [ ] Create **Production** release, upload AAB, write release notes
- [ ] Set **countries / regions** for availability
- [ ] Submit for review (first review can take several days)

---

### Reference

- Play Console: <https://play.google.com/console>
- Expo → Android deployment: <https://docs.expo.dev/deploy/submit-to-app-stores/>
- Launch checklist (official): <https://support.google.com/googleplay/android-developer/answer/9859152>
