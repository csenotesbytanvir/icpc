// api/generate.js
// এই API শুধুমাত্র একটি নির্দিষ্ট মডেলের জন্য তৈরি, যা Cline-এর জটিল URL এড়িয়ে যাবে।

const fetch = require('node-fetch');

const TARGET_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const SYSTEM_INSTRUCTION = "You are an expert C programming assistant. Always generate code and explanations strictly in the C programming language. Do not include any comments in the code. Provide only the finished C code and necessary explanation, if required.";

export default async (req, res) => {
    // CORS Headers সেট করা
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type, x-goog-api-key, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed.');
        return;
    }

    let requestBody = req.body || {};
    
    // System Instruction যোগ করা
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
    
    // **গুরুত্বপূর্ণ:** এখানে কোনো Path পার্সিং দরকার নেই, কারণ URLটি ফিক্সড!
    
    try {
        const response = await fetch(TARGET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey, 
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        
        res.status(response.status).json(data);

    } catch (error) {
        res.status(500).send(`Custom API Error: ${error.message}`);
    }
};
