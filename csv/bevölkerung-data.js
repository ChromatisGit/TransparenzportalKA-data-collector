const fs = require('fs')

function innerJoin(obj1, obj2) {
    let result = {};

    // Iterate over the keys of the first object
    for (let key in obj1) {
      // Check if the key exists in the second object as well
      if (obj2.hasOwnProperty(key)) {
        // Add the key-value pairs to the result object
        result[key] = {...obj1[key], ...obj2[key]};
      }
    }

    return result;
}

const data = JSON.parse(fs.readFileSync('rows.json', 'utf8'))
const categoryData = JSON.parse(fs.readFileSync('categories.json', 'utf8'))

const newData = innerJoin(categoryData,data)

fs.writeFileSync('categories2.json', JSON.stringify(newData, null, 2))