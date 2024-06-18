const fs = require('fs');
const csv = require('csv-parser');

function splitByFormat() {
    const types = {CSV:[],PDF:[],GeoJSON:[],others:[]};

    fs.createReadStream('resources/resources.csv')
        .pipe(csv({ delimiter: ',' }))
        .on('data', (data) => {
            if(data.format in types) {
                types[data.format].push(data)
            }
            else {
                types.others.push(data)
            }
        })
        .on('end', () => {
            Object.entries(types).forEach(([key, val]) =>{
                fs.writeFileSync(`${key}.json`, JSON.stringify(val, null, 2))
            })
        });
}

splitByFormat()