const fs = require('fs');

// Read the original data from file
fs.readFile('poi/categories.json', 'utf8', (err, data) => {
  if (err) throw err;

  const originalData = JSON.parse(data);
  const convertedData = {};

  // Convert the original data to the desired format
  for (const category in originalData) {
    if (originalData.hasOwnProperty(category)) {
      originalData[category].forEach(item => {
        convertedData[item] = category;
      });
    }
  }

  // Write the converted data back to file
  fs.writeFile('poi/categories2.json', JSON.stringify(convertedData, null, 2), 'utf8', (err) => {
    if (err) throw err;
  });
});