# Staymark

A stay-booking app for **Android and iOS**, built with Expo / React Native. The design is Apple-style: a warm neutral palette, pill-shaped controls, a floating tab bar and full light and dark modes. The logo is a black-and-white bookmark.

## Download the APK

Every push builds a fresh APK with GitHub Actions (`.github/workflows/android-apk.yml`).

1. Open the repo's **Releases** page, or **Actions → Build Android APK → latest run → Artifacts**.
2. Download `Staymark.apk` on your Android phone and open it.
3. If Android asks, allow **Install unknown apps** for your browser or Files app.

## Features

| Area | What works |
|---|---|
| **Accounts** | Sign up (with password strength rules), sign in, sign out, reset your password with a 6-digit code, edit your profile and photo, change your password, delete your account |
| **Explore** | Category chips, popular stays carousel, recently viewed, recommendations |
| **Search** | Where / When / Who search, availability by date, guest counts, sorting, filters (price, type, bedrooms, amenities, Instant Book, Superhost) |
| **Listing** | Photo carousel, share, save to wishlist, highlights, amenities, reviews, map / directions, house rules, cancellation policy, message the host |
| **Booking** | Range calendar that blocks unavailable dates, guests, extras, saved cards, price breakdown with fees, taxes and a weekly discount, confirmation code |
| **Trips** | Upcoming / Past / Cancelled, trip details, cancel, directions, message the host, write a review, book again |
| **Inbox** | Chats with hosts (with auto-replies) and support, a notification centre with unread badges |
| **Notifications** | Real device notifications: booking confirmed, new message, a reminder the day before check-in, a test notification. Each type has its own on/off switch |
| **Settings** | Light / Dark / Automatic theme, haptics, language & currency (USD, EUR, GBP, PHP, JPY, AUD), payments (cards are checked with the Luhn test and only the last 4 digits are stored), help centre, terms & privacy |
| **Hosting** | Become a host, list your space with photos, host dashboard (listings, reservations, earnings), delete a listing |

All data, including accounts, lives on the device (AsyncStorage). Passwords are salted and hashed with SHA-256. Payments are simulated, and no card is ever charged.

## Develop

```bash
npm install
npx expo start          # scan the QR code with Expo Go (iOS / Android)
npm run typecheck
```

Build locally (needs the Android SDK): `npx expo prebuild -p android && cd android && ./gradlew assembleRelease`.
Build with EAS instead: `npx eas build -p android --profile preview` for an APK, or `-p ios` (needs an Apple developer account).

Regenerate the logo assets with `python3 scripts/generate-icons.py`.
