/**
 * KaamSetu AI Module — Central index
 * Re-exports all AI sub-modules for convenient imports.
 */

const { calculateMatchScore, calculateMatchScores } = require('./matchEngine');
const { processVoiceRegistration } = require('./voiceRegistration');
const { generateGigDescription } = require('./gigGenerator');
const { checkWorkerFraud, checkGigFraud } = require('./fraudDetection');
const { sendJobAlert } = require('./jobAlerts');

module.exports = {
  calculateMatchScore,
  calculateMatchScores,
  processVoiceRegistration,
  generateGigDescription,
  checkWorkerFraud,
  checkGigFraud,
  sendJobAlert,
};
