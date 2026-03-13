const express = require('express');
const router = express.Router();

/**
 * GET /webhook
 * WhatsApp webhook verification (for future integration)
 */
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403).json({ success: false, error: 'Verification failed' });
  }
});

/**
 * POST /webhook
 * Receive WhatsApp messages (stub)
 */
router.post('/', async (req, res) => {
  try {
    const { body } = req;
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // TODO: Process incoming WhatsApp messages
    // 1. Parse audio messages for voice registration
    // 2. Handle text commands (check status, accept gig, etc.)
    // 3. Route to appropriate AI processor

    res.status(200).json({ success: true, data: { message: 'Webhook received' } });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
