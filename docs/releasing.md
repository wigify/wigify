# Releasing Wigify

## Overview

Releases are triggered manually via GitHub Actions. The workflow bumps the version, builds the macOS app (universal binary — Intel + Apple Silicon), uploads artifacts to a GitHub Release, and commits the version bump back to the repo.

## Prerequisites

### 1. Apple Developer Certificate (Code Signing)

Code signing is **optional** for open-source distribution but recommended. Without it, users will see a "damaged app" warning on macOS and need to run `xattr -cr /Applications/Wigify.app`.

If you want to sign:

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
2. Open **Keychain Access** → **Certificate Assistant** → **Request a Certificate from a Certificate Authority**
   - Enter your email, select **Saved to disk**, click **Continue**
3. Go to [Apple Developer Certificates](https://developer.apple.com/account/resources/certificates/list)
   - Click **+** → select **Developer ID Application** → upload your CSR
   - Download the `.cer` file and double-click to install in Keychain
4. Export the certificate as `.p12`:
   - In Keychain Access, find the certificate under **My Certificates**
   - Right-click → **Export** → choose `.p12` format
   - Set a strong password (you'll need this for `MAC_CERTIFICATE_PASSWORD`)
5. Base64-encode the `.p12` file:
   ```sh
   base64 -i Certificates.p12 -o cert-base64.txt
   ```
6. The contents of `cert-base64.txt` is your `MAC_CERTIFICATE` secret

### 2. Apple Notarization

Notarization is required for macOS apps to pass Gatekeeper without warnings. It requires code signing (step 1) to be set up first.

1. Go to [appleid.apple.com](https://appleid.apple.com/) → **Sign-In and Security** → **App-Specific Passwords**
2. Click **Generate an app-specific password**, name it something like `wigify-ci`
3. Copy the generated password — this is your `APPLE_APP_SPECIFIC_PASSWORD` secret
4. Your **Apple ID** is the email you use to sign into your Apple Developer account
5. Your **Team ID** can be found at [developer.apple.com/account](https://developer.apple.com/account/) → **Membership Details**

### 3. GitHub Secrets

Go to your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret                        | Required | Description                                             |
| ----------------------------- | -------- | ------------------------------------------------------- |
| `MAC_CERTIFICATE`             | Yes      | Base64-encoded `.p12` certificate (from step 1)         |
| `MAC_CERTIFICATE_PASSWORD`    | Yes      | Password you set when exporting the `.p12`              |
| `MAC_KEYCHAIN_PASSWORD`       | Yes      | Any strong password (used to create a temp CI keychain) |
| `APPLE_ID`                    | Yes      | Your Apple Developer account email                      |
| `APPLE_APP_SPECIFIC_PASSWORD` | Yes      | App-specific password (from step 2)                     |
| `APPLE_TEAM_ID`               | Yes      | Your Apple Developer Team ID (from step 2)              |

> `GITHUB_TOKEN` is provided automatically by GitHub Actions — no setup needed.
>
> `MAC_KEYCHAIN_PASSWORD` can be any random string — it's only used to lock/unlock a temporary keychain during CI. Generate one with `openssl rand -base64 32`.

## How to Release

1. Go to the repo on GitHub
2. Click **Actions** tab
3. Select **Release** workflow from the sidebar
4. Click **Run workflow**
5. Enter the version number (e.g. `1.2.0`) — no `v` prefix
6. Click **Run workflow**

The workflow will:

- Install dependencies
- Run typecheck, lint, and tests
- Bump `package.json` version
- Build the macOS universal app (DMG + ZIP)
- Create a GitHub Release with the built artifacts
- Commit the version bump and tag `v1.2.0` back to the repo

## Auto-Update

The app uses `electron-updater` configured for GitHub Releases. When a new release is published:

1. The running app checks for updates on launch
2. If an update is found, it downloads automatically in the background
3. A toast notification appears in the bottom-right corner saying the update is ready
4. The user clicks **Restart** to install and relaunch, or dismisses it (the update installs on next quit)

### What gets uploaded to the release

- `Wigify-Mac-{version}-universal.dmg` — installer for new users
- `Wigify-Mac-{version}-universal.zip` — used by auto-updater
- `latest-mac.yml` — metadata file for `electron-updater` to detect new versions

## Version Numbering

Use [Semantic Versioning](https://semver.org/):

- **Patch** (`1.0.1`): bug fixes
- **Minor** (`1.1.0`): new features, backward-compatible
- **Major** (`2.0.0`): breaking changes
