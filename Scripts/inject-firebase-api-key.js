// scripts/inject-firebase-api-key.js
const fs = require('fs');
const path = require('path');

// Define the path to your index.html file relative to this script
const filePath = path.join(__dirname, '..', 'index.html');
// Define the placeholder string in index.html
const placeholder = '___FIREBASE_API_KEY_PLACEHOLDER___';

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Get the API key from Netlify's environment variable
    const apiKey = process.env.FIREBASE_API_KEY;

    if (!apiKey) {
        console.error('ERROR: FIREBASE_API_KEY environment variable is NOT set in Netlify. Please set it in Site settings -> Build & deploy -> Environment variables.');
        process.exit(1); // Exit with an error code to fail the build
    }

    // Replace the placeholder with the actual API key
    content = content.replace(placeholder, apiKey);

    // Write the modified content back to index.html
    fs.writeFileSync(filePath, content, 'utf8');

    console.log('SUCCESS: Firebase API key securely injected into index.html from Netlify environment variable.');

} catch (error) {
    console.error('ERROR: Failed to inject Firebase API key during Netlify build:', error);
    process.exit(1); // Exit with an error code to fail the build
}
