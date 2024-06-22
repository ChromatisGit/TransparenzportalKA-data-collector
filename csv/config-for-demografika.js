const fs = require('fs');

function transformCategories(categories, isCategory = true) {
  const result = [];
  for (const categoryKey in categories) {
    if (categories.hasOwnProperty(categoryKey)) {
      const category = categories[categoryKey];
      const transformedCategory = {
        name: category.name,
        description: category.description,
      };
      if(isCategory) {
          if (category.subcategories) {
              transformedCategory.subcategories = transformCategories(category.subcategories, false);
            }
      }
      else {
          transformedCategory.resources = category.resources
      }
      result.push(transformedCategory);
    }
  }
  return result;
}

const data = JSON.parse(fs.readFileSync('csv/CSV.json', 'utf8'))
const categoryData = JSON.parse(fs.readFileSync('csv/categories.json', 'utf8'))

const settings = {
    "renameProperties": {},
    "defaultFilters": {
      "Jahr": {
        "min": 2021,
        "max": 2021
      }
    },
    "skipPropertiesRegEx": "^_id$",
    "visualizations": {
      "barChart": {
        "axisPairs": []
      },
      "table": {}
    }
}

const settings2 = {
    "skipPropertiesRegEx": "^_id$",
    "visualizations": {
      "barChart": {
        "axisPairs": [
          {
            "xAxis": "",
            "yAxis": ""
          }
        ]
      },
      "table": {}
    }
}

const rename = {
    "mannlich (%)": "Männlich",
    "mannlich": "Männlich",
    "weiblich (%)": "Weiblich",
    "weiblich": "Weiblich",
    "Auslander/-innen": "Ausländer/-innen",
    "Manneranteil": "Männeranteil",
    "Auslander/-innen (%)": "Ausländer/-innen",
    "Haushalte %": "Haushalte",
    "Deutsche mit Migrationshintergrund (%)": "Deutsche mit Migrationshintergrund",
    "Migrant/-innen %": "Migrant/-innen",
    "Hunde je 1.000 Bewohner/-innen (Wohnberechtigte)": "Hunde je 1000 Wohnberechtigte",
    "Hunde je 1.000 Haushalte (HH)": "Hunde je 1000 Haushalte",
    "Altersklasse %": "Altersklasse",
    "Gemeinschaftsschule %": "Gemeinschaftsschule",
    "Gymnasium %": "Gymnasium",
    "Haupt-/Werkrealschule %": "Haupt-/Werkrealschule",
    "Realschule %": "Realschule",
    "Wiederholer/ Sonstige %": "Wiederholer/Sonstige",
    "Wohngebaeude": "Wohngebäude",
    "Wohngebaude": "Wohngebäude",
    "1- und 2-Fam.häuser %": "1- & 2-Familienhäuser",
    "Wohngeb. mit 2 Wohnungen": "Wohngebäude mit 2 Wohnungen",
    "Wohngeb. mit 1 Wohnung": "Wohngebäude mit 1 Wohnung",
    "Wohngeb. mit 3-6 Wohnungen": "Wohngebäude mit 3-6 Wohnungen",
    "Wohngeb. mit 7 u. mehr Wohnungen": "Wohngebäude mit 7+ Wohnungen",
    "ubergegangene Schuler/-innen": "Übergegangene Schüler/-innen",
}

const remainingData = []
const newData = {resources:[],categories:{}}


data.forEach((e) => {
    if(!(e.id in categoryData)) {
        remainingData.push({...e, ...settings2 });
        return;
    }

    const {category, subcategory, name, s3, s4, s5} = categoryData[e.id]
    const res = {...e, ...structuredClone(settings), name}

    res.source = `https://transparenz.karlsruhe.de/datastore/dump/${res.id}?bom=True`

    delete res.package

    const rows = []
    if (s3 !== "") rows.push(s3);
    if (s4 !== "") rows.push(s4);
    if (s5 !== "") rows.push(s5);

    const renamedRows = rows.map(s => {
        if(!(s in rename)) {
            return s;
        }
        res.renameProperties[s] = rename[s];
        return rename[s]
    })

    renamedRows.forEach((s) => {
        res.visualizations.barChart.axisPairs.push({
            "xAxis": "Stadtteil",
            "yAxis": s
          })
    })

    newData.resources.push(res);
    if (!newData.categories[category]) {
      newData.categories[category] = {name: category, description: "ToDo", subcategories: {}}
    }
    if(!newData.categories[category].subcategories[subcategory]) {
      newData.categories[category].subcategories[subcategory] = {name: subcategory, description: "ToDo", resources: []}
    }
    newData.categories[category].subcategories[subcategory].resources.push(res.id);
})

newData.categories = transformCategories(newData.categories)

fs.writeFileSync('GesellschaftNeu.json', JSON.stringify(newData, null, 2))
fs.writeFileSync('remainingNeu.json', JSON.stringify(remainingData, null, 2))