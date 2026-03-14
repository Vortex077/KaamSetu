const { GoogleGenerativeAI } = require('@google/generative-ai');

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

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
       responseMimeType: "application/json",
    }
  });

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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('[GigGenerator] Raw Gemini Response:', text);

    try {
      // Clean up markdown blocks if Gemini added them despite responseMimeType
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanText);
      return { ...parsedData, status: 'generated' };
    } catch (parseErr) {
      console.error('[GigGenerator] Parse error:', parseErr.message, 'Raw text:', text);
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
    console.error('[GigGenerator] Gemini SDK error:', error.message);
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
