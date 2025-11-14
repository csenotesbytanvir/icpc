const fetch = require('node-fetch');

const TARGET_URL = "https://generativelanguage.googleapis.com";

const SYSTEM_INSTRUCTION = "You are an expert C programming assistant. Always generate code and explanations strictly in the C programming language. Do not include any comments in the code. Provide only the finished C code and necessary explanation, if required.";

export default async (req, res) => {
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type, x-goog-api-key, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed. Only POST is supported.');
        return;
    }

    let requestBody = req.body || {};
    
   
    if (requestBody.contents) {
        requestBody.contents.unshift({
            role: "system",
            parts: [{ text: SYSTEM_INSTRUCTION }]
        });
    }

    const apiKey = process.env.GEMINI_API_KEY; 
    if (!apiKey) {
        res.status(500).send('Server Error: API Key not configured on Vercel.');
        return;
    }
    
   
    const urlParts = req.url.split('/api/proxy');
    const path = urlParts.length > 1 ? urlParts[1] : req.url;
    
    const targetUrl = `${TARGET_URL}${path}`;

    
    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
                'x-goog-api-key': apiKey, 
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        
        // Response পাঠানো
        res.status(response.status).json(data);

    } catch (error) {
        console.error("Gemini Fetch Error:", error);
        res.status(500).send(`Proxy Fetch Error: ${error.message}`);
    }
};
