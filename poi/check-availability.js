const fs = require('fs');


fs.readFile('poi/points-of-interest.json', 'utf8', async (err, data) => {
  if (err) throw err;

  const originalData = JSON.parse(data);
  const convertedData = [];


  for (const resource of originalData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const response = await fetch(resource.source)

    const data = JSON.parse(await response.text())

    if(!(data.features) ) {
        console.log(data)
        continue;
    }

    if (data.features.length === 0) {
        continue;
    }

    const gruppenValues = data.features.map(e => e.properties.GRUPPENNAME_DE)
    const gruppen = [...new Set(gruppenValues)];

    if(gruppen.length > 1) {
        console.log(`${resource.name}`)
    }

    convertedData.push(resource)
    console.log(".")
  }


  fs.writeFile('poi/points-of-interest-refined.json', JSON.stringify(convertedData, null, 2), 'utf8', (err) => {
    if (err) throw err;
  });
});