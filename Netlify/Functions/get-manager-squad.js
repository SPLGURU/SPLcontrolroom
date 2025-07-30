// netlify/functions/get-manager-squad.js
const fetch = require('node-fetch');

// Helper function to introduce a delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to fetch data with retries
async function fetchWithRetry(url, maxRetries = 3, baseDelayMs = 200) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return response.json();
            }
            // Handle rate limiting or server errors
            if (response.status === 429 || response.status >= 500) {
                const delay = baseDelayMs * Math.pow(2, retries);
                console.warn(`Attempt ${retries + 1} failed for ${url} with status ${response.status}. Retrying in ${delay}ms...`);
                await sleep(delay);
                retries++;
            } else {
                // For other errors, fail immediately
                throw new Error(`Failed to fetch ${url}: HTTP status ${response.status}`);
            }
        } catch (error) {
            console.error(`Fetch error for ${url} (attempt ${retries + 1}):`, error.message);
            if (retries === maxRetries - 1) throw error;
            retries++;
        }
    }
    throw new Error(`Failed to fetch ${url} after ${maxRetries} retries.`);
}

exports.handler = async function(event, context) {
    const managerId = event.queryStringParameters.id;
    const round = event.queryStringParameters.round || 1; // Default to round 1 if not provided

    if (!managerId || !/^\d+$/.test(managerId)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Manager ID is required and must be a valid number.' })
        };
    }

    const picksUrl = `https://en.fantasy.spl.com.sa/api/entry/${managerId}/event/${round}/picks/`;

    try {
        const data = await fetchWithRetry(picksUrl);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Allow requests from your site
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error(`Critical error fetching squad for manager ${managerId}, round ${round}:`, error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch manager squad data.', details: error.message })
        };
    }
};