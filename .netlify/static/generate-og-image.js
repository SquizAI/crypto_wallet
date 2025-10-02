// This script would normally use node-canvas or puppeteer to generate the image
// For now, we'll note that the og-image.html can be manually screenshotted
console.log("To generate og-image.png:");
console.log("1. Open og-image.html in a browser");
console.log("2. Set viewport to 1200x630");
console.log("3. Take a screenshot and save as og-image.png");
console.log("\nOr use this command with Playwright:");
console.log("npx playwright screenshot file://$(pwd)/og-image.html og-image.png --viewport-size=1200,630");
