const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Processes a voice note from a worker giving feedback on a completed gig.
 * Extracts a numeric star rating (1-5) and a concise text translation of their feedback.
 */
async function processVoiceReview(audioFileUrl) {
  try {
    console.log(`[VoiceReview] Fetching voice note from URL: ${audioFileUrl}`);
    
    // Download the Telegram voice note locally/into memory
    const response = await axios({
      method: 'GET',
      url: audioFileUrl,
      responseType: 'arraybuffer'
    });
    
    const audioData = Buffer.from(response.data).toString('base64');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
You are an AI assistant for KaamSetu, reading feedback from a blue-collar worker about their recent job experience with a Hirer.
Listen to this voice note in Hindi/Hinglish.
Extract a star rating (1 to 5) based on the tone and words, and translate their spoken feedback into a short English sentence.

Respond STRICTLY with a valid JSON object. Do not include markdown blocks like \`\`\`json. Only raw JSON.
Example format:
{"rating": 5, "feedback": "The hirer was very polite and paid on time."}
    `.trim();

    console.log(`[VoiceReview] Analyzing feedback with Gemini 2.5 Flash...`);

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "audio/ogg", 
          data: audioData
        }
      }
    ]);

    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const extractedData = JSON.parse(responseText);
    
    console.log(`[VoiceReview] Successfully extracted review:`, extractedData);

    return {
      rating: extractedData.rating || 5, // Default to 5 if undefined
      feedback: extractedData.feedback || 'Good experience.',
    };
    
  } catch (error) {
    console.error("[VoiceReview] Error analyzing feedback voice note:", error.message);
    if (error.response) console.error(error.response.data);
    
    // Graceful fallback
    return {
      rating: 5,
      feedback: 'Good work environment.',
    };
  }
}

module.exports = { processVoiceReview };
