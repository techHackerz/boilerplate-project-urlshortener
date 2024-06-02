// routes/url.js
const express = require('express');
const Url = require('../models/urlModel');
const router = express.Router();
const http = require('http');

// Helper function to validate URL format
const isValidUrl = (urlString) => {
    try {
        new URL(urlString);
        return true;
    } catch (e) {
        return false;
    }
};

// Custom DNS lookup function
const dnsLookup = (hostname, callback) => {
    const options = {
        hostname: hostname,
        method: 'HEAD',
        port: 80,
        path: '/'
    };

    const req = http.request(options, (res) => {
        callback(null, true);
    });

    req.on('error', (e) => {
        callback(e, false);
    });

    req.end();
};

// Generate a short URL identifier
const generateShortUrl = () => {
    return Math.random().toString(36).substring(2, 8);
};

// POST /api/shorturl
router.post('/shorturl', (req, res) => {
    const { url: original_url } = req.body;

    // Validate URL format
    if (!isValidUrl(original_url)) {
        return res.json({ error: 'invalid url' });
    }

    const hostname = new URL(original_url).hostname;

    // Custom DNS lookup
    dnsLookup(hostname, async (err, isReachable) => {
        if (err || !isReachable) {
            return res.json({ error: 'invalid url' });
        }

        // Check if the URL already exists in the database
        let url = await Url.findOne({ original_url });
        if (!url) {
            // Generate a unique short URL
            let short_url;
            let isUnique = false;

            while (!isUnique) {
                short_url = generateShortUrl();
                const existingUrl = await Url.findOne({ short_url });
                if (!existingUrl) {
                    isUnique = true;
                }
            }

            url = new Url({ original_url, short_url });
            await url.save();
        }

        res.json({
            original_url: url.original_url,
            short_url: url.short_url,
        });
    });
});

// GET /api/shorturl/:short_url
router.get('/shorturl/:short_url', async (req, res) => {
    const { short_url } = req.params;
    const url = await Url.findOne({ short_url });

    if (url) {
        res.redirect(url.original_url);
    } else {
        res.json({ error: 'No URL found' });
    }
});

module.exports = router;
