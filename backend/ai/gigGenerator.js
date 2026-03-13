/**
 * Gig Generator AI Module — Gemini-powered
 * Takes raw/minimal hirer input and generates a polished gig posting
 * with structured title, description, and skill suggestions.
 */
const axios = require('axios');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate a polished gig posting from raw hirer input.
 * @param {Object} rawInput - { title?, description?, skills?, payPerDay?, duration?, companyType? }
 * @returns {{ title, description, skillsRequired, suggestedPay, tips }}
 */
async function generateGigDescription(rawInput) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_key') {
    console.warn('[GigGenerator] GEMINI_API_KEY not set, returning passthrough');
    return {
      title: rawInput.title || 'Untitled Gig',
      description: rawInput.description || rawInput.title || '',
      skillsRequired: rawInput.skills || [],
      suggestedPay: rawInput.payPerDay || null,
      tips: [],
      status: 'api_key_missing',
    };
  }

  const prompt = `You are a gig posting assistant for KaamSetu, a daily-wage job platform in India.

A hirer wants to post a gig. Here's what they provided:
- Title/Summary: "${rawInput.title || 'not provided'}"
- Description: "${rawInput.description || 'not provided'}"
- Skills they mentioned: ${(rawInput.skills || []).join(', ') || 'none'}
- Pay offered: ₹${rawInput.payPerDay || '?'}/day for ${rawInput.duration || '?'} days
- Business type: ${rawInput.companyType || 'unknown'}
- Location: ${rawInput.city || 'unknown'}

Generate a professional, clear, and attractive gig posting in this JSON format:
{
  "title": "Clear, specific job title (max 60 chars)",
  "description": "Detailed 2-3 sentence description. Include what the worker will do, working hours if applicable, and any requirements. Write in simple English that can be easily translated to Hindi.",
  "skillsRequired": ["skill1", "skill2", "skill3"],
  "suggestedPay": <number or null if the offered pay seems fair>,
  "tips": ["tip1 for the hirer to improve the posting"]
}

If the offered pay seems too low for the work described, suggest a fair market rate in suggestedPay. If pay is reasonable, set suggestedPay to null.
Keep skills lowercase and practical (e.g. "cooking", "cleaning", "electrician", not "hard working").`;

  try {
    const response = await axios.post(`${GEMINI_API_URL}?key=${apiKey}`, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    }, { timeout: 15000 });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    try {
      const result = JSON.parse(text);
      return { ...result, status: 'generated' };
    } catch {
      return {
        title: rawInput.title || 'Untitled Gig',
        description: text || rawInput.description || '',
        skillsRequired: rawInput.skills || [],
        suggestedPay: null,
        tips: [],
        status: 'parse_error',
      };
    }
  } catch (error) {
    console.error('[GigGenerator] Gemini error:', error.message);
    return {
      title: rawInput.title || 'Untitled Gig',
      description: rawInput.description || '',
      skillsRequired: rawInput.skills || [],
      suggestedPay: null,
      tips: [],
      status: 'error',
    };
  }
}

module.exports = { generateGigDescription };
