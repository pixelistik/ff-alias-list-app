#!/usr/bin/env bash
ROOT=$1
VERSION=$(git describe | grep -E -o "[0-9]+\.[0-9]+\.[0-9]+")

echo "Android version string is $VERSION (from git tag)"

sed -i "s/android:versionName=\"[0-9.]*\"/android:versionName=\"$VERSION\"/" "$ROOT/platforms/android/AndroidManifest.xml"
