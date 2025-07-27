const fs = require('fs');
const path = require('path');

// Define the path to your index.html file
const indexPath = path.resolve(__dirname, '../index.html');

// Read the content of index.html
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Get environment variables from Netlify build environment
const firebaseApiKey = process.env.FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY_HERE_IF_LOCAL'; // Fallback for local testing
const bootstrapStaticApiUrl = process.env.BOOTSTRAP_STATIC_API_URL_PLACEHOLDER || 'https://en.fantasy.spl.com.sa/api/bootstrap-static/'; // Fallback for local testing
const fixturesApiBaseUrl = process.env.FIXTURES_API_BASE_URL_PLACEHOLDER || 'https://en.fantasy.spl.com.sa/api/fixtures/?event='; // Fallback for local testing

// Replace the placeholders in the HTML content
htmlContent = htmlContent.replace('___FIREBASE_API_KEY_PLACEHOLDER___', firebaseApiKey);
htmlContent = htmlContent.replace('___BOOTSTRAP_STATIC_API_URL_PLACEHOLDER___', bootstrapStaticApiUrl);
htmlContent = htmlContent.replace('___FIXTURES_API_BASE_URL_PLACEHOLDER___', fixturesApiBaseUrl);

// Write the modified content back to index.html
fs.writeFileSync(indexPath, htmlContent, 'utf8');

console.log('Environment variables injected into index.html successfully!');
