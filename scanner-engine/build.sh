#!/usr/bin/env bash
# Build script for Render.com

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Installing Playwright browsers..."
playwright install chromium

echo "Build complete!"
