const express = require('express');
const axios = require('axios');

const router = express.Router();

// In-memory cache: key = query string, value = { data, timestamp }
const geocodeCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// Rate-limit: 1 request per second to Nominatim (OSM policy)
let lastRequestTime = 0;

/**
 * GET /api/geocode
 * Backend proxy to Nominatim geocoding.
 * Query params:
 *   ?q=<search query>        — forward geocode (address → coords)
 *   ?lat=<lat>&lon=<lon>     — reverse geocode (coords → address)
 */
router.get('/', async (req, res) => {
  try {
    const { q, lat, lon } = req.query;

    if (!q && (!lat || !lon)) {
      return res.status(400).json({
        success: false,
        error: 'Provide either ?q=<query> for forward geocoding or ?lat=&lon= for reverse',
      });
    }

    // Build cache key
    const cacheKey = q ? `fwd:${q.toLowerCase().trim()}` : `rev:${lat},${lon}`;

    // Check cache
    const cached = geocodeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ success: true, data: cached.data, cached: true });
    }

    // Rate-limit: wait if needed
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < 1000) {
      await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
    }
    lastRequestTime = Date.now();

    // Build Nominatim request
    let url, params;
    if (q) {
      // Forward geocode
      url = `${NOMINATIM_BASE}/search`;
      params = { q, format: 'json', limit: 5, addressdetails: 1, countrycodes: 'in' };
    } else {
      // Reverse geocode
      url = `${NOMINATIM_BASE}/reverse`;
      params = { lat, lon, format: 'json', addressdetails: 1 };
    }

    const response = await axios.get(url, {
      params,
      headers: { 'User-Agent': 'KaamSetu/1.0 (hackathon project)' },
      timeout: 5000,
    });

    const results = Array.isArray(response.data) ? response.data : [response.data];

    // Normalize results
    const data = results.map((r) => ({
      displayName: r.display_name,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      address: r.address || {},
      city: r.address?.city || r.address?.town || r.address?.village || r.address?.state_district || '',
    }));

    // Store in cache
    geocodeCache.set(cacheKey, { data, timestamp: Date.now() });

    // Prune cache if too large (> 500 entries)
    if (geocodeCache.size > 500) {
      const oldest = [...geocodeCache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 100);
      oldest.forEach(([key]) => geocodeCache.delete(key));
    }

    res.json({ success: true, data, cached: false });
  } catch (error) {
    console.error('Geocode error:', error.message);
    res.status(500).json({ success: false, error: 'Geocoding failed' });
  }
});

module.exports = router;
