const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Cache for access token
let accessToken = null;
let tokenExpiry = null;

// Get or refresh access token
async function getAccessToken() {
    // Check if we have a valid token
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(process.env.FORTIUM_TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.FORTIUM_CLIENT_ID,
                client_secret: process.env.FORTIUM_CLIENT_SECRET,
                audience: process.env.FORTIUM_AUDIENCE,
                grant_type: 'client_credentials'
            })
        });

        if (!response.ok) {
            throw new Error(`Token request failed: ${response.status}`);
        }

        const data = await response.json();
        accessToken = data.access_token;
        // Set expiry to 5 minutes before actual expiry for safety
        tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

        console.log('Access token refreshed successfully');
        console.log('Token starts with:', accessToken.substring(0, 50) + '...');
        return accessToken;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the embed version (clean, no header/controls)
app.get('/embed', (req, res) => {
    res.sendFile(path.join(__dirname, 'embed.html'));
});

// Proxy API calls to Fortium Partners API with OAuth2 authentication
app.get('/api/users', async (req, res) => {
    try {
        const token = await getAccessToken();
        const fetch = (await import('node-fetch')).default;

        const response = await fetch(`${process.env.FORTIUM_API_URL}/api/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/api/companies', async (req, res) => {
    try {
        const token = await getAccessToken();
        const fetch = (await import('node-fetch')).default;

        const response = await fetch(`${process.env.FORTIUM_API_URL}/api/companies`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
});

// UserCompanies endpoint only supports Create, Update, Delete - no GET operation
// If you need to create/update/delete user-company relationships, add POST/PUT/DELETE endpoints here

// Endpoint to get environment configuration for the frontend
app.get('/api/config', (req, res) => {
    res.json({
        logodevToken: process.env.LOGODEV_TOKEN || 'pk_demo_token'
    });
});

// Logo.dev search proxy endpoint
app.get('/api/logo/:domain', async (req, res) => {
    try {
        const { domain } = req.params;
        const fetch = (await import('node-fetch')).default;

        const response = await fetch(`https://api.logo.dev/search?q=${encodeURIComponent(domain)}`, {
            headers: {
                'Authorization': `Bearer: ${process.env.LOGODEV_SEARCH_TOKEN}`
            }
        });

        if (!response.ok) {
            return res.status(404).json({ error: 'Logo not found' });
        }

        const results = await response.json();
        if (results.length === 0) {
            return res.status(404).json({ error: 'Logo not found' });
        }

        // Return the first result's logo URL
        res.json({ logoUrl: results[0].logo_url });
    } catch (error) {
        console.error('Error fetching logo:', error);
        res.status(500).json({ error: 'Failed to fetch logo' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Fortium Partners Logo Wall running on http://localhost:${PORT}`);
    console.log('\n📋 Environment check:');
    console.log('- FORTIUM_API_URL:', process.env.FORTIUM_API_URL ? '✓ Set' : '✗ Missing');
    console.log('- FORTIUM_CLIENT_ID:', process.env.FORTIUM_CLIENT_ID ? '✓ Set' : '✗ Missing');
    console.log('- FORTIUM_CLIENT_SECRET:', process.env.FORTIUM_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
    console.log('- FORTIUM_API_KEY:', process.env.FORTIUM_API_KEY ? '✓ Set' : '✗ Missing');
    console.log('- LOGODEV_TOKEN:', process.env.LOGODEV_TOKEN ? '✓ Set' : '✗ Missing');
    console.log('\n💡 Select "Partner Connect API" in the data source dropdown to test with live data');
});