const fs = require('fs');

const data = JSON.parse(fs.readFileSync('CSV.json', 'utf8'))
const categoryData = JSON.parse(fs.readFileSync('categories.json', 'utf8'))

const settings = {
    "renameProperties": {},
    "defaultFilters": {
      "Jahr": {
        "min": 2021,
        "max": 2021
      }
    },
    "visualizations": {
      "barChart": {
        "axisPairs": []
      },
      "table": {}
    }
}

const settings2 = {
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
    "männlich (%)": "Männlich",
    "männlich": "Männlich",
    "weiblich (%)": "Weiblich",
    "weiblich": "Weiblich",
    "Ausländer/-innen (%)": "Ausländer/-innen",
    "Haushalte %": "Haushalte",
    "Deutsche mit Migrationshintergrund (%)": "Deutsche mit Migrationshintergrund",
    "Migrant/-innen %": "Migrant/-innen",
    "Hunde je 1.000 Bewohner/-innen (Wohnberechtigte)": "Hunde je 1.000 Wohnberechtigte",
    "Hunde je 1.000 Haushalte (HH)": "Hunde je 1.000 Haushalte",
    "Altersklasse %": "Altersklasse",
    "Gemeinschaftsschule %": "Gemeinschaftsschule",
    "Gymnasium %": "Gymnasium",
    "Haupt-/Werkrealschule %": "Haupt-/Werkrealschule",
    "Realschule %": "Realschule",
    "Wiederholer/ Sonstige %": "Wiederholer/Sonstige",
    "Wohngebaeude": "Wohngebäude"
}

const remainingData = []
const newData = []


data.forEach((e) => {
    if(!(e.id in categoryData)) {
        remainingData.push({...e, ...settings2 });
        return;
    }

    const {category, subcategory, name, s3, s4, s5} = categoryData[e.id]
    const res = {...e, ...structuredClone(settings), name, category, subcategory}

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

    newData.push(res);
})

fs.writeFileSync('Gesellschaft.json', JSON.stringify(newData, null, 2))
fs.writeFileSync('CSV3.json', JSON.stringify(remainingData, null, 2))