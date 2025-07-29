const fs = require('fs');
const path = require('path');

// Define the path to your index.html file
const indexPath = path.resolve(__dirname, '../index.html');

// Read the content of index.html
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Get environment variables from Netlify build environment
const firebaseApiKey = process.env.FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY_HERE_IF_LOCAL';
const firebaseAuthDomain = process.env.FIREBASE_AUTH_DOMAIN || 'YOUR_FIREBASE_AUTH_DOMAIN_HERE_IF_LOCAL';
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || 'YOUR_FIREBASE_PROJECT_ID_HERE_IF_LOCAL';
const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET || 'YOUR_FIREBASE_STORAGE_BUCKET_HERE_IF_LOCAL';
const firebaseMessagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_FIREBASE_MESSAGING_SENDER_ID_HERE_IF_LOCAL';
const firebaseAppId = process.env.FIREBASE_APP_ID || 'YOUR_FIREBASE_APP_ID_HERE_IF_LOCAL';

// Also include the API endpoints if they are meant to be injected by this script
const bootstrapStaticApiUrl = process.env.BOOTSTRAP_STATIC_API_URL_PLACEHOLDER || 'https://en.fantasy.spl.com.sa/api/bootstrap-static/';
const fixturesApiBaseUrl = process.env.FIXTURES_API_BASE_URL_PLACEHOLDER || 'https://en.fantasy.spl.com.sa/api/fixtures/?event=';

// Replace the placeholders in the HTML content
htmlContent = htmlContent.replace('{{FIREBASE_API_KEY}}', firebaseApiKey);
htmlContent = htmlContent.replace('{{FIREBASE_AUTH_DOMAIN}}', firebaseAuthDomain);
htmlContent = htmlContent.replace('{{FIREBASE_PROJECT_ID}}', firebaseProjectId);
htmlContent = htmlContent.replace('{{FIREBASE_STORAGE_BUCKET}}', firebaseStorageBucket);
htmlContent = htmlContent.replace('{{FIREBASE_MESSAGING_SENDER_ID}}', firebaseMessagingSenderId);
htmlContent = htmlContent.replace('{{FIREBASE_APP_ID}}', firebaseAppId);

// Replace API endpoint placeholders if they exist in index.html
htmlContent = htmlContent.replace('{{API_BOOTSTRAP_STATIC}}', bootstrapStaticApiUrl);
htmlContent = htmlContent.replace('{{API_FIXTURES_BASE}}', fixturesApiBaseUrl);


// Write the modified content back to index.html
fs.writeFileSync(indexPath, htmlContent, 'utf8');

console.log('Environment variables injected into index.html successfully!');
