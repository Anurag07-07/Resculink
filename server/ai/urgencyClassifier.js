const natural = require('natural');

const classifyUrgency = (text) => {
  const lowerText = text.toLowerCase();
  
  const criticalKeywords = ['trapped', 'bleeding', 'unconscious', 'dying', 'fire', 'flood', 'heart attack', 'stroke', 'emergency', 'critical', 'severe injury'];
  const highKeywords = ['injured', 'broken', 'pain', 'no food', 'no water', 'baby', 'child', 'pregnant', 'elderly', 'sick', 'infection'];
  const mediumKeywords = ['lost', 'stuck', 'cold', 'wet', 'hungry', 'thirsty', 'medicine', 'shelter needed'];
  
  // Check for critical
  if (criticalKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'critical';
  }
  
  // Check for high
  if (highKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'high';
  }
  
  // Check for medium
  if (mediumKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
};

module.exports = { classifyUrgency };
