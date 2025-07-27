    // functions/spl-proxy.js
    exports.handler = async function(event, context) {
        const { url } = event.queryStringParameters;

        if (!url) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing "url" query parameter.' })
            };
        }

        try {
            // Make the request to the external API
            const response = await fetch(url);
            
            // Check if the response is successful
            if (!response.ok) {
                return {
                    statusCode: response.status,
                    body: JSON.stringify({ error: `Failed to fetch data from external API: ${response.statusText}` })
                };
            }

            const data = await response.json();

            return {
                statusCode: 200,
                headers: {
                    // Allow CORS from any origin for now.
                    // In a production app, you might want to restrict this to your Netlify domain.
                    'Access-Control-Allow-Origin': '*', 
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            };
        } catch (error) {
            console.error('Proxy function error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Internal Server Error during proxy request.', details: error.message })
            };
        }
    };
    