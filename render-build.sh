# render-build.sh
echo "Running Render build script..."

# Install dependencies (for Render to install npm packages)
npm install

# Ensure puppeteer dependencies are installed
npx puppeteer install

echo "Build completed successfully!"