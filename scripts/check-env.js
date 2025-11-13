o// Simple env check script
// Run from project root: node ./scripts/check-env.js
require('dotenv').config();

console.log('PINECONE_API_KEY present:', !!process.env.PINECONE_API_KEY);
console.log('PINECONE_INDEX:', process.env.PINECONE_INDEX || '<not set>');
console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);

// Helpful output: list all variables that start with common prefixes
Object.keys(process.env)
  .filter(k => /PINECONE|OPENAI|API|KEY/i.test(k))
  .forEach(k => console.log(`${k}=${process.env[k] ? '<set>' : '<empty>'}`));
