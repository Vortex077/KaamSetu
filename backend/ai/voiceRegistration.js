/**
 * Voice Registration AI Module
 * Processes Telegram voice notes in Hindi/Hinglish to extract worker profile data.
 * Uses Gemini 2.5 Flash for multimodal Audio-to-JSON reasoning.
 */

const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function processVoiceRegistration(audioFileUrl, chatId) {
  try {
    console.log(`[VoiceRegistration] Fetching voice note from URL: ${audioFileUrl}`);
    
    // 1. Download the Telegram voice note locally/into memory
    const response = await axios({
      method: 'GET',
      url: audioFileUrl,
      responseType: 'arraybuffer'
    });
    
    const audioData = Buffer.from(response.data).toString('base64');
    
    // 2. Initialize Gemini 2.5 Flash
    // We expect the GEMINI_API_KEY in the environment
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
You are an AI assistant for a local job platform in India called KaamSetu.
Listen to this voice note in Hindi/Hinglish from a blue-collar worker.
Extract the following information from the audio:
- name (string)
- skills (array of strings). CRITICAL SKILLS RULE: You MUST ONLY select exact strings from this official list: ["electrician", "plumber", "carpenter", "painter", "mason", "cleaning", "helper", "driver", "delivery", "welding", "cook", "guard", "mechanic"]. If their spoken skills don't match perfectly, map it to the closest category. If it doesn't match at all, use ["helper"].
- city (string)
- dailyRate (number, extract the daily expected pay in INR, just the number)

Respond STRICTLY with a valid JSON object. Do not include markdown blocks like \`\`\`json. Only raw JSON.
Example format:
{"name": "Ramesh", "skills": ["plumber"], "city": "Faridabad", "dailyRate": 600}
    `.trim();

    console.log(`[VoiceRegistration] Analyzing audio with Gemini 2.5 Flash...`);

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "audio/ogg", // Telegram voice notes are generally OGG format
          data: audioData
        }
      }
    ]);

    let responseText = result.response.text();
    // Clean up if the model includes markdown blocks by accident
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const extractedData = JSON.parse(responseText);
    
    console.log(`[VoiceRegistration] Successfully extracted:`, extractedData);

    return {
      name: extractedData.name || 'Unknown',
      skills: extractedData.skills && extractedData.skills.length > 0 ? extractedData.skills : ['Mazdoor/Helper'],
      city: extractedData.city || 'Delhi',
      dailyRate: extractedData.dailyRate || 500,
    };
    
  } catch (error) {
    console.error("[VoiceRegistration] Error analyzing voice note:", error.message);
    if (error.response) console.error(error.response.data);
    // Return a graceful fallback if something goes wrong
    return {
      name: 'Kaamgar',
      skills: ['Helper'],
      city: 'Local',
      dailyRate: 500,
    };
  }
}

module.exports = { processVoiceRegistration };
