require('dotenv').config();
const { generateGigDescription } = require('./ai/gigGenerator');

async function test() {
  const rawInput = {
    description: "need a plumber for 2 days",
    hireType: "daily_gig",
    payPerDay: 500,
    duration: 2
  };
  console.log("Input:", rawInput);
  const result = await generateGigDescription(rawInput);
  console.log("Result:", result);
}
test();
