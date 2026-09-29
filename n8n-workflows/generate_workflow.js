const fs = require('fs');
const path = require('path');

// Read the canonical workflow from healthaids_doccam_processor.json
const sourceFile = path.join(__dirname, 'healthaids_doccam_processor.json');
const workflowData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

const outputPath = path.join(__dirname, 'healthaids_doccam_processor.json');
fs.writeFileSync(outputPath, JSON.stringify(workflowData, null, 2));
console.log('Successfully validated and synced workflow file at:', outputPath);
