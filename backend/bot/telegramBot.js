const TelegramBot = require('node-telegram-bot-api');
const { processVoiceRegistration } = require('../ai/voiceRegistration');
const { processVoiceReview } = require('../ai/voiceReview');
const GigJob  = require('../models/GigJob');
const Worker  = require('../models/Worker');
const Hirer   = require('../models/Hirer');
const Application = require('../models/Application');

let bot;
if (process.env.TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

  // Handle 409 Conflict when multiple teammates use the same token
  bot.on('polling_error', (error) => {
    if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
      console.warn('⚠️ [Telegram Bot] Another instance is already polling (409 Conflict). Stopping polling on this machine to prevent crash loops. Bot features will only work on the active machine.');
      bot.stopPolling();
    } else {
      console.error('[Telegram Bot Polling Error]:', error.message);
    }
  });


  // /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
      `🙏 *KaamSetu mein swagat hai!*\n\n` +
      `Kaam dhundhne ke liye apna *voice note* bhejein Hindi mein.\n\n` +
      `Bolein: apna naam, kaam (skills), sheher, aur roz ki fees\n\n` +
      `_Misal: "Mera naam Ramesh hai, main plumber hoon, ` +
      `Faridabad mein rehta hoon, 600 rupaye roz leta hoon"_`,
      { parse_mode: 'Markdown' }
    );
  });

  // Voice note — runs full AI pipeline (Profile Creation OR Job Review)
  bot.on('voice', async (msg) => {
    const chatId = msg.chat.id;

    // Find existing profile if any
    const existingWorker = await Worker.findOne({ telegramChatId: String(chatId) });
    
    // --- INTERCEPT CHECK: Is there a completed gig waiting for a review? ---
    if (existingWorker) {
      const gigToReview = await GigJob.findOne({ 
        hiredWorkerId: existingWorker._id, 
        status: 'completed', 
        hirerReviewed: false 
      });

      if (gigToReview) {
        bot.sendMessage(chatId, '⏳ Aapki aawaz sun kar review save kiya ja raha hai...');
        try {
          const fileId   = msg.voice.file_id;
          const fileInfo = await bot.getFile(fileId);
          const fileUrl  = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;
          const review   = await processVoiceReview(fileUrl);
          
          const hirer = await Hirer.findById(gigToReview.hirerId);
          
          if (hirer) {
            hirer.reviews.push({
              gigId: gigToReview._id,
              workerId: existingWorker._id,
              rating: review.rating,
              feedback: review.feedback
            });
            
            const totalRating = hirer.reviews.reduce((sum, rev) => sum + rev.rating, 0);
            hirer.rating = totalRating / hirer.reviews.length;
            hirer.totalHires += 1; // Assuming total jobs/hires tracks experiences
            await hirer.save();
          }

          gigToReview.hirerReviewed = true;
          await gigToReview.save();

          return bot.sendMessage(chatId, `✅ *Review Save Ho Gaya!*\n\nAapne ${review.rating}🌟 ki rating di aur kaha: "${review.feedback}"\n\nNaya Kaam aane par hum aapko fir batayenge!`, { parse_mode: 'Markdown' });
        } catch (err) {
          console.error('[VoiceReview Bot Error]', err);
          return bot.sendMessage(chatId, '❌ Review sunne mein problem hui. Dubara bhejein.');
        }
      }
    }
    // ----------------------------------------------------------------------

    bot.sendMessage(chatId, '⏳ Sunaa ja raha hai... (Purani profile hai toh update ho jayegi)');
    try {
      const fileId   = msg.voice.file_id;
      const fileInfo = await bot.getFile(fileId);
      const fileUrl  = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;
      const profile  = await processVoiceRegistration(fileUrl, chatId);
      
      let coordinates = [0, 0];
      if (profile.city) {
          try {
             const axios = require('axios');
             const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: { q: profile.city, format: 'json', limit: 1, countrycodes: 'in' },
                headers: { 'User-Agent': 'KaamSetuBot/1.0' }
             });
             if (geoRes.data && geoRes.data.length > 0) {
                coordinates = [parseFloat(geoRes.data[0].lon), parseFloat(geoRes.data[0].lat)];
             }
          } catch(e) {
             console.error('Bot Geocoding error:', e.message);
          }
      }

      bot.sendMessage(chatId,
        `✅ *Profile ban gaya!*\n\n` +
        `👤 ${profile.name}\n🔧 Skills: ${profile.skills.join(', ')}\n` +
        `📍 ${profile.city}\n💰 ₹${profile.dailyRate}/din\n\n` +
        `Confirm karne ke liye *1* bhejein\n` +
        `Cancel karne ke liye *2* bhejein`,
        { parse_mode: 'Markdown' }
      );
      
      const locationData = {
          type: "Point",
          coordinates: coordinates,
          city: profile.city
      };

      if (!existingWorker) {
          await Worker.create({
            name: profile.name,
            phone: 'Pending',
            skills: profile.skills,
            location: locationData,
            dailyRate: profile.dailyRate,
            telegramChatId: String(chatId),
            isAvailable: false // Not active until 1 is pressed
          });
      } else {
          // Update the existing profile and force re-confirmation
          await Worker.findByIdAndUpdate(existingWorker._id, {
            name: profile.name,
            skills: profile.skills,
            location: locationData,
            dailyRate: profile.dailyRate,
            isAvailable: false // Force them to press 1 again for the new details
          });
      }
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, '❌ Kuch problem hui. Dobara try karein.');
    }
  });

  // Phone number collection (Accepts pure 10 digits)
  bot.onText(/^\s*(\d{10})\s*$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const phoneNum = match[1];
    const worker = await Worker.findOne({ telegramChatId: String(chatId) });
    if (!worker) return;

    await Worker.findByIdAndUpdate(worker._id, {
      phone: phoneNum
    });

    bot.sendMessage(chatId,
      `📱 Phone number save ho gaya!\n\n` +
      `Ab apna account verify karne ke liye apna *12-digit Aadhaar number* likh kar bhejein.\n` +
      `_Misal: 123456789012_`,
      { parse_mode: 'Markdown' }
    );
  });

  // Aadhaar collection (Accepts pure 12 digits)
  bot.onText(/^\s*(\d{12})\s*$/, async (msg, match) => {
    const chatId       = msg.chat.id;
    const aadhaarNum   = match[1];
    const worker       = await Worker.findOne({ telegramChatId: String(chatId) });
    if (!worker) return;

    if (worker.phone === 'Pending' || !worker.phone) {
        return bot.sendMessage(chatId, `Pehle apna 10-digit phone number bhejein.\n_Misal: 9876543210_`, { parse_mode: 'Markdown' });
    }

    await Worker.findByIdAndUpdate(worker._id, {
      aadhaarNumber:     aadhaarNum,
      isAadhaarVerified: false // pending UIDAI integration
    });

    bot.sendMessage(chatId,
      `🆔 Aadhaar save ho gaya! 🎉\n\n` +
      `*Aapki registration ab puri tarah se COMPLETE ho chuki hai!* Aapka account active hai. ✅\n\n` +
      `📸 **(Optional/Marzi Hai)**: Agar aap chahein toh apne pichle kaam ki *photos bhejein* (Jaise banaya hua furniture, theek kiya pipe). Photos bhejne se Kaam jaldi milta hai.\n\n` +
      `Agar photos nahi bhejni hain, toh aap phone band kar sakte hain. Naya Kaam aane par hum aapko yahin message karenge!`,
      { parse_mode: 'Markdown' }
    );
  });

  // Photo upload collection (Portfolio Pictures)
  bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const worker = await Worker.findOne({ telegramChatId: String(chatId) });
    if (!worker) return;

    bot.sendMessage(chatId, '⚙️ Photo save ho rahi hai...');

    try {
      // Telegram sends multiple sizes, get the largest one
      const photoId = msg.photo[msg.photo.length - 1].file_id;
      const fileInfo = await bot.getFile(photoId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;

      // Download image and convert to Base64
      const response = await fetch(fileUrl);
      const buffer = await response.arrayBuffer();
      const base64Photo = `data:${response.headers.get('content-type')};base64,${Buffer.from(buffer).toString('base64')}`;

      // Push to portfolio
      await Worker.findByIdAndUpdate(worker._id, {
        $push: { portfolioPhotos: base64Photo }
      });

      bot.sendMessage(chatId, `✅ Aapke pichle kaam ki photo profile me add ho gayi!\n\nAur photos bhejna chahein toh bhej sakte hain.\n\n*Aapki profile active hai, jab koi naya Kaam aayega toh hum aapko yahin message karenge.*`, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Error saving telegram photo:', err);
      bot.sendMessage(chatId, '❌ Photo save nahi ho payi. Kripya dubara bhejein.');
    }
  });

  // Reply "1" — profile confirm OR job accept
  bot.onText(/^1$/, async (msg) => {
    const chatId = msg.chat.id;
    const worker = await Worker.findOne({ telegramChatId: String(chatId) });
    if (!worker) return bot.sendMessage(chatId, 'Pehle apna voice note bhejein.');

    const pendingGig = await GigJob.findOne({
      hiredWorkerId: worker._id,
      status:        'payment_held'
    });

    if (pendingGig) {
      // Worker is accepting a job
      await GigJob.findByIdAndUpdate(pendingGig._id, {
        status:            'worker_accepted',
        contactRevealedAt: new Date()
      });
      const hirer = await Hirer.findById(pendingGig.hirerId);

      // Notify hirer via browser push
      const { sendPush } = require('../services/pushService');
      if (hirer.pushSubscription) {
        await sendPush(hirer.pushSubscription, {
          title: 'KaamSetu — Worker Accepted! ✅',
          body:  `${worker.name} ne aapka kaam accept kar liya!`,
          url:   `/hirer/manage/${pendingGig._id}`
        });
      }

      bot.sendMessage(chatId,
        `✅ *Kaam Confirm!*\n\n` +
        `📞 Hirer: ${hirer.phone}\n` +
        `🏪 ${hirer.businessName || hirer.name}\n📍 ${pendingGig.location.address || pendingGig.location.city}\n\n` +
        `All the best! 💪`,
        { parse_mode: 'Markdown' }
      );
    } else {
      // Confirming profile
      await Worker.findByIdAndUpdate(worker._id, {
        isAvailable:      true,
        telegramChatId:   String(chatId),
        telegramUsername: msg.from.username || null
      });
      bot.sendMessage(chatId,
        `🎉 *KaamSetu par aapka swagat hai!*\n\n` +
        `✅ Aapki profile confirm ho gayi hai.\n\n` +
        `Apne account mein ek valid *10-digit mobile number* jodein.\n` +
        `_Misal: 9876543210_`,
        { parse_mode: 'Markdown' }
      );
    }
  });

  // Reply "2" — decline job OR cancel profile creation
  bot.onText(/^2$/, async (msg) => {
    const chatId = msg.chat.id;
    const worker = await Worker.findOne({ telegramChatId: String(chatId) });
    if (!worker) return;

    const pendingGig = await GigJob.findOne({
      hiredWorkerId: worker._id,
      status:        'payment_held'
    });
    
    if (!pendingGig) {
      if (!worker.isAvailable) {
         await Worker.findByIdAndDelete(worker._id);
         return bot.sendMessage(chatId, '❌ Profile cancel ho gaya. Naya account banane ke liye naya voice note bhejein.');
      }
      return; 
    }

    await GigJob.findByIdAndUpdate(pendingGig._id, {
      status:        'cancelled',
      paymentStatus: 'refunded'
    });
    bot.sendMessage(chatId, 'Theek hai! Agli baar zaroor kaam milega. 🙏');

    // Notify next ranked worker
    const nextMatch   = await Application
      .findOne({ gigId: pendingGig._id, status: 'matched', workerId: { $ne: worker._id } })
      .sort({ matchScore: -1 });

    if (nextMatch) {
      const nextWorker = await Worker.findById(nextMatch.workerId);
      const hirer      = await Hirer.findById(pendingGig.hirerId);
      if (nextWorker?.telegramChatId) {
        await GigJob.findByIdAndUpdate(pendingGig._id, {
          status:          'payment_held',
          hiredWorkerId:   nextWorker._id,
          paymentHeldAt:   new Date(),
          workerTimeoutAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
        });
        await notifyWorker(nextWorker, pendingGig, hirer);
      }
    }
  });

} else {
  console.log("⚠️ Telegram Bot Token missing or placeholder. Skipping Telegram bot polling.");
  bot = {
    sendMessage: (chatId, msg) => { console.log(`[Telegram simulated msg to ${chatId}]: ${msg}`) }
  };
}

// Send job notification to Segment A worker
const notifyWorker = async (worker, gig, hirer) => {
  if (!worker.telegramChatId) return;
  const hrs = process.env.WORKER_ACCEPTANCE_TIMEOUT_HOURS || 2;
  await bot.sendMessage(
    worker.telegramChatId,
    `🔔 *Naya Kaam Aaya!*\n\n` +
    `💼 ${gig.title}\n🏪 ${hirer.businessName || hirer.name}\n` +
    `💰 ₹${gig.payPerDay}/din × ${gig.duration} din = ₹${gig.totalPay}\n` +
    `📍 ${gig.location.city || 'Nearby'}\n\n` +
    `✅ *Payment already secure — ₹${gig.totalPay}*\n\n` +
    `Accept: *1* bhejein\nDecline: *2* bhejein\n\n` +
    `_${hrs} ghante mein jawab dein_`,
    { parse_mode: 'Markdown' }
  );
};

// Gracefully stop polling on exit
process.once('SIGINT', () => bot.stopPolling());
process.once('SIGTERM', () => bot.stopPolling());

module.exports = { bot, notifyWorker };
