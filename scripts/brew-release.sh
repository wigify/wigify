#!/bin/bash
set -euo pipefail

REPO="wigify/wigify"
TAP_REPO="wigify/homebrew-tap"

VERSION=$(gh release view --repo "$REPO" --json tagName -q '.tagName' | sed 's/^v//')

if [ -z "$VERSION" ]; then
  echo "Failed to fetch latest release version"
  exit 1
fi

echo "Latest release: v$VERSION"

ARM64_URL="https://github.com/$REPO/releases/download/v${VERSION}/Wigify-Mac-${VERSION}-arm64.zip"
X64_URL="https://github.com/$REPO/releases/download/v${VERSION}/Wigify-Mac-${VERSION}-x64.zip"

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

echo "Downloading arm64 zip..."
curl -fSL "$ARM64_URL" -o "$TMPDIR/arm64.zip"
echo "Downloading x64 zip..."
curl -fSL "$X64_URL" -o "$TMPDIR/x64.zip"

SHA256_ARM64=$(shasum -a 256 "$TMPDIR/arm64.zip" | awk '{print $1}')
SHA256_X64=$(shasum -a 256 "$TMPDIR/x64.zip" | awk '{print $1}')

echo "SHA256 arm64: $SHA256_ARM64"
echo "SHA256 x64:   $SHA256_X64"

gh repo clone "$TAP_REPO" "$TMPDIR/homebrew-tap"

cat > "$TMPDIR/homebrew-tap/Casks/wigify.rb" << EOF
cask "wigify" do
  version "$VERSION"

  on_arm do
    sha256 "$SHA256_ARM64"
    url "https://github.com/$REPO/releases/download/v#{version}/Wigify-Mac-#{version}-arm64.zip"
  end

  on_intel do
    sha256 "$SHA256_X64"
    url "https://github.com/$REPO/releases/download/v#{version}/Wigify-Mac-#{version}-x64.zip"
  end

  name "Wigify"
  desc "Create and display custom HTML/CSS/JS widgets on your desktop"
  homepage "https://github.com/$REPO"

  livecheck do
    url :url
    strategy :github_latest
  end

  app "Wigify.app"

  zap trash: [
    "~/Library/Application Support/wigify",
    "~/Library/Preferences/com.wigify.app.plist",
    "~/Library/Saved Application State/com.wigify.app.savedState",
  ]
end
EOF

cd "$TMPDIR/homebrew-tap"
git add Casks/wigify.rb
git commit -m "Update wigify to $VERSION"
git push

echo "Homebrew tap updated to v$VERSION"
