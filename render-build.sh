#!/usr/bin/env bash
# exit on error
set -o errexit

npm install

# Use the official Render example for installing FFmpeg
apt-get update && apt-get install -y ffmpeg