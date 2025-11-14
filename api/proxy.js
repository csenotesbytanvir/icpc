// api/proxy.js
// Vercel-এর জন্য চূড়ান্ত, ত্রুটিমুক্ত প্রক্সি কোড (URL অবজেক্ট ব্যবহার করে)

const fetch = require('node-fetch');

const TARGET_BASE_URL = "https://generativelanguage.googleapis.com";
const SYSTEM_INSTRUCTION = "You are an expert C programming assistant. Always generate code and explanations strictly in the C programming language. Do not include any comments in the code. Provide only the finished C code and necessary explanation, if required.";

export default async (req, res) => {
    // 1. CORS Headers সেট করা
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
    
    // 2. টার্গেট URL তৈরি করা (চূড়ান্ত সমাধান: URL অবজেক্ট ব্যবহার)
    const requestUrl = new URL(req.url, `https://${req.headers.host}`);
    
    // /api/proxy/v1beta/models/... থেকে শুধু /v1beta/models/... অংশটি বের করা
    const pathSegments = requestUrl.pathname.split('/api/proxy');
    const apiPath = pathSegments.length > 1 ? pathSegments[1] : requestUrl.pathname;
    
    const targetUrl = `${TARGET_BASE_URL}${apiPath}${requestUrl.search}`; // Path এবং Query দুটোই ব্যবহার করা হলো

    // 3. Gemini API তে কল করা
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
        
        res.status(response.status).json(data);

    } catch (error) {
        console.error("Gemini Fetch Error:", error);
        res.status(500).send(`Proxy Fetch Error: ${error.message}`);
    }
};
