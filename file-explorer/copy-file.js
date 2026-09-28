const fs = require('fs');

fs.readFile('./source.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading source.txt:', err);
    return;
  }

  fs.writeFile('./destination.txt', data, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing destination.txt:', writeErr);
      return;
    }

    console.log('File copied successfully from source.txt to destination.txt');
  });
});
