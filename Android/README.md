# PlanMyNord VPN for Android

Native Android prototype for the PlanMyNord VPN client.

## Current state

- Mobile interface written in Java with Android platform APIs.
- Norwegian, Russian and English language switcher.
- The selected language is stored locally.
- Registration and login use the same PlanMyNord website account.
- Account sessions are encrypted with Android Keystore; device registration and VPN plan state use the website account API.
- The account screen links to VPN purchase on the website.
- The Xray and TUN code is present, but connection stays gated until the website can issue an individual server profile.
- VPN payment remains disabled until profile delivery is configured on the server.

## Requirements to build

- Android Studio with Android SDK 37.
- Android Gradle Plugin 9.4.0 / Gradle 9.6.0.
- JDK 17 (Android Studio provides a compatible runtime).

Open this folder in Android Studio, allow Gradle sync, then build the debug APK.

## Security boundary

Do not embed 3x-ui admin credentials, Cloudflare tokens, private keys or subscription management secrets in the APK. A future production client should receive a limited user profile from an authenticated PlanMyNord endpoint and store secrets with Android Keystore-backed encryption.

The real VPN milestone requires:

1. A reviewed Xray-compatible Android core.
2. A strict subscription/profile schema.
3. Android `VpnService.Builder` routing and DNS configuration.
4. Foreground notification and reliable disconnect cleanup.
5. Traffic leak, IPv6 and DNS leak tests.
6. Signed release APK/AAB and an update strategy.
