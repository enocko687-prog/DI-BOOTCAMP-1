const fs = require('fs');

fs.readdir('.', (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  console.log('Files in this directory:');
  files.forEach(file => console.log(file));
});
