
const field = "Country";
const level = "campaign";
const currentStructure = "{Channel}/{Country}/{SubChannel}";
const token = `{${field}}`;

console.log(`Field: ${field}`);
console.log(`Token: ${token}`);
console.log(`Current Structure: ${currentStructure}`);

// Current Implementation Logic
const escapedToken = token.replace('{', '\\{').replace('}', '\\}');
console.log(`Escaped Token: ${escapedToken}`);

const regexString = `\\/?\\{${escapedToken}\\}`;
console.log(`Regex String: ${regexString}`);

const regex = new RegExp(regexString, 'g');
console.log(`Regex: ${regex}`);

const nextStructure = currentStructure.replace(regex, '').replace(/^\//, '');
console.log(`Next Structure (Current Logic): ${nextStructure}`);

// Expected: "{Channel}/{SubChannel}"
// Actual likely: "{Channel}/{Country}/{SubChannel}" (no change)

// Proposed Fix
const fixedRegexString = `\\/?${escapedToken}`;
console.log(`Fixed Regex String: ${fixedRegexString}`);

const fixedRegex = new RegExp(fixedRegexString, 'g');
console.log(`Fixed Regex: ${fixedRegex}`);

const fixedNextStructure = currentStructure.replace(fixedRegex, '').replace(/^\//, '');
console.log(`Next Structure (Proposed Fix): ${fixedNextStructure}`);
