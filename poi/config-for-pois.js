const fs = require('fs');

function transformCategories(categories) {
  const result = [];
  for (const categoryKey in categories) {
    if (categories.hasOwnProperty(categoryKey)) {
      const category = categories[categoryKey];
      const transformedCategory = {
        name: category.name,
        description: category.description,
        resources: category.resources
      };
      result.push(transformedCategory);
    }
  }
  return result;
}

const data = JSON.parse(fs.readFileSync('poi/points-of-interest.json', 'utf8'))
const categoryData = JSON.parse(fs.readFileSync('poi/categories.json', 'utf8'))

const settings = {
    "type": "GeoJSON",
    "renameProperties": {"NAME": "Name"},
    "skipPropertiesRegEx": "^UPDATED|GRUPPENNAME_DE$",
    "visualizations": {
      "map": {}
    }
}

const newData = {resources:[],categories:{}}

data.forEach((e) => {

    const {name, source, id} = e
    const res = {name, source: source.replaceAll(" ","%20"), id, ...structuredClone(settings)}

    newData.resources.push(res);

    const category = categoryData[name] ?? "Kategorielos";

    if (!newData.categories[category]) {
      newData.categories[category] = {name: category, description: "ToDo", resources: []}
    }

    newData.categories[category].resources.push(res.id);
})

newData.categories = transformCategories(newData.categories)

fs.writeFileSync('POIs.json', JSON.stringify(newData, null, 2))