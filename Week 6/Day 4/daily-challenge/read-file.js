const fs = require('fs');
const path = require('path');

function readFileData() {
  const filePath = path.join(__dirname, 'files', 'file-data.txt');
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(content.trim());
}

module.exports = { readFileData };
