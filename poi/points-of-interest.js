const fs = require('fs')

const geoJSONs = JSON.parse(fs.readFileSync('points-of-interest.json', 'utf8'))

console.log(JSON.stringify(geoJSONs.map(e => e.name)))