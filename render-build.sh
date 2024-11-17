#!/usr/bin/env bash

# Ensure the script stops if any command fails
set -e

# Install Puppeteer dependencies for Render's environment
apt-get update && apt-get install -y wget --no-install-recommends \
  && apt-get install -y \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxrandr2 \
    libxtst6 \
    xdg-utils \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    unzip \
    fonts-ipafont-gothic \
    libgbm-dev

# Install Puppeteer chrome if not installed
npx puppeteer install

# Any other installation commands for your app
npm install