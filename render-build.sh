#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing npm dependencies..."
npm install

echo "Downloading and installing FFmpeg..."
curl -sL https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz | tar xJ --strip-components=1 -C /usr/local/bin/ ffmpeg-*-amd64-static/ffmpeg

echo "Build finished."