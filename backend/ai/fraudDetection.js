/**
 * Fraud Detection AI Module — Gemini-powered
 * Detects suspicious activity: fake profiles, duplicate accounts,
 * rating manipulation, unrealistic gig postings, etc.
 */
const axios = require('axios');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Call Gemini API with a prompt.
 */
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_key') {
    console.warn('[FraudDetection] GEMINI_API_KEY not set, returning stub response');
    return null;
  }

  const response = await axios.post(`${GEMINI_API_URL}?key=${apiKey}`, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  }, { timeout: 15000 });

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/**
 * Check a worker profile for fraud signals.
 * @param {Object} worker - Worker document
 * @returns {{ isSuspicious, confidence, reasons, suggestions }}
 */
async function checkWorkerFraud(worker) {
  const prompt = `You are a fraud detection system for a daily-wage job platform in India called KaamSetu.

Analyze this worker profile for suspicious signals:
- Name: ${worker.name}
- Phone: ${worker.phone}
- Skills: ${(worker.skills || []).join(', ')}
- Daily Rate: ₹${worker.dailyRate}
- Experience: ${worker.experience || 'not provided'}
- Rating: ${worker.rating} (from ${worker.totalJobs} jobs)
- Registration Method: ${worker.registrationMethod}
- Location: ${worker.location?.city || 'unknown'}

Check for:
1. Unrealistic skill combinations (e.g., brain surgeon + plumber)
2. Suspiciously low or high daily rates for the listed skills
3. Rating inconsistencies (very high rating with very few jobs)
4. Missing critical info

Respond as JSON: { "isSuspicious": boolean, "confidence": 0-100, "reasons": ["..."], "suggestions": ["..."] }`;

  try {
    const result = await callGemini(prompt);
    if (!result) {
      return { isSuspicious: false, confidence: 0, reasons: [], suggestions: [], status: 'api_key_missing' };
    }
    return { ...result, status: 'checked' };
  } catch (error) {
    console.error('[FraudDetection] Gemini error:', error.message);
    return { isSuspicious: false, confidence: 0, reasons: [], suggestions: [], status: 'error' };
  }
}

/**
 * Check a gig posting for fraud/spam.
 * @param {Object} gig - GigJob document
 * @param {Object} hirer - Hirer document
 * @returns {{ isSuspicious, confidence, reasons, suggestions }}
 */
async function checkGigFraud(gig, hirer) {
  const prompt = `You are a fraud detection system for KaamSetu, a daily-wage job platform in India.

Analyze this gig posting for suspicious signals:
- Title: ${gig.title}
- Description: ${gig.description}
- Skills Required: ${(gig.skillsRequired || []).join(', ')}
- Pay: ₹${gig.payPerDay}/day × ${gig.duration} days = ₹${gig.totalPay}
- Location: ${gig.location?.city || 'unknown'}
- Hirer: ${hirer.name} (${hirer.companyType || 'unknown type'})
- Hirer Rating: ${hirer.rating}, Total Gigs Posted: ${hirer.totalGigsPosted}

Check for:
1. Suspiciously high pay that could be a scam/lure
2. Vague or copy-paste descriptions
3. Skill requirements that don't match the job
4. New hirer with suspicious posting patterns
5. Potentially illegal or exploitative work

Respond as JSON: { "isSuspicious": boolean, "confidence": 0-100, "reasons": ["..."], "suggestions": ["..."] }`;

  try {
    const result = await callGemini(prompt);
    if (!result) {
      return { isSuspicious: false, confidence: 0, reasons: [], suggestions: [], status: 'api_key_missing' };
    }
    return { ...result, status: 'checked' };
  } catch (error) {
    console.error('[FraudDetection] Gemini error:', error.message);
    return { isSuspicious: false, confidence: 0, reasons: [], suggestions: [], status: 'error' };
  }
}

module.exports = { checkWorkerFraud, checkGigFraud };
