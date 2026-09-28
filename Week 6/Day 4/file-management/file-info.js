const fs = require('fs');
const path = require('path');

function showFileInfo() {
  const filePath = path.join(__dirname, 'data', 'example.txt');
  const exists = fs.existsSync(filePath);
  const fileStats = exists ? fs.statSync(filePath) : null;

  console.log('File exists:', exists);
  if (fileStats) {
    console.log('File size:', fileStats.size, 'bytes');
    console.log('Creation time:', fileStats.ctime.toISOString());
  } else {
    console.log('File size: N/A');
    console.log('Creation time: N/A');
  }
}

module.exports = { showFileInfo };
