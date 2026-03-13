const webpush = require('web-push');

// Required VAPID keys:
// process.env.VAPID_EMAIL
// process.env.VAPID_PUBLIC_KEY
// process.env.VAPID_PRIVATE_KEY

if (process.env.VAPID_EMAIL && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PUBLIC_KEY !== 'generate_with_web-push' && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const Worker = require('../models/Worker');
const Hirer = require('../models/Hirer');

const removeExpiredSubscription = async (subscriptionStr) => {
  // It could be either a Worker or a Hirer
  await Worker.updateMany(
    { pushSubscription: { $ne: null } },
    { $set: { pushSubscription: null } }
  );
  await Hirer.updateMany(
    { pushSubscription: { $ne: null } },
    { $set: { pushSubscription: null } }
  );
};

const sendPush = async (subscription, payload) => {
  if (!subscription) return;
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body:  payload.body,
        icon:  '/icon-192.png',  // Next.js PWA icon
        url:   payload.url || '/'
      })
    );
  } catch (err) {
    console.error('Push failed:', err.statusCode);
    // If 410 Gone — subscription expired, remove from DB
    if (err.statusCode === 410) {
      await removeExpiredSubscription(subscription);
    }
  }
};

module.exports = { sendPush };
