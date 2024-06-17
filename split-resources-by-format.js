const fs = require('fs');
const csv = require('csv-parser');

function removeDuplicatesFromAnleihen() {
    const today = new Date();
    const records = {};
    const path = 'data/neueAnleihen.csv'

    fs.createReadStream(path)
        .pipe(csv({ delimiter: ',' }))
        .on('data', (data) => {
            const name = data.Unternehmensname;
            if (!records[name] || couponRendite(data, today) > couponRendite(records[name], today)) {
                records[name] = data;
            }
        })
        .on('end', () => {
            const csv = convertJSONtoCSV(Object.values(records), ['Kaufdatum', 'Unternehmensname', 'Branche des Hauptkonzern', 'Anteile', 'Stückelung', 'Kaufkurs', 'Coupon', 'Wechselkurs am Kauftag', 'Währung', 'Zinszahlungen pro Jahr', 'Letzter Zinstermin', 'Land', 'Börse', 'ISIN', 'Quelle', 'Kaufbar', 'Bereits Gekauft'])
            fs.promises.writeFile(path, csv)
        });
}