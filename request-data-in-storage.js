const fs = require('fs').promises;

async function appendEntryToCSV(filePath, entry) {
    try {
        let csvRow = entry
            .map(e => {
                if (typeof e === 'string' && e.includes(',')) {
                    return `"${e}"`; // Enclose fields containing commas in quotes
                }
                return e;
            })
            .join(',') + '\n';
        await fs.appendFile(filePath, csvRow, 'utf8');
    } catch (error) {
        console.error(`Error appending to CSV file: ${error}`);
        throw error;
    }
}


async function request(uri) {
    const response = await fetch(uri)
    const text = await response.text();
    if(response.status !== 200 && response.status !== 404) {
        console.error(text)
    }
    const result = JSON.parse(text);
    if (!result.success) {
        throw new Error(result.error.__type);
    }
    return result.result;
}

async function getIds() {
    const result = await request("https://transparenz.karlsruhe.de/api/3/action/datastore_search?resource_id=_table_metadata&limit=300")
    const ids = result.records.map(e => e.name)
    return ids;
}

async function getMetadata(id) {
    let result;
    try {
        result = await request(`https://transparenz.karlsruhe.de/api/3/action/resource_show?id=${id}`);
    }
    catch (error) {
        if (error.message === 'Not Found Error' || error.message === 'Authorization Error') {
            return undefined;
        }
        throw error;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    const { name, format, description, instantatlas_ka_id } = result
    return { name, format, description, atlas: instantatlas_ka_id };
}


async function getData(id) {
    let result;
    try {
        result = await request(`https://transparenz.karlsruhe.de/api/3/action/datastore_search?limit=1000&resource_id=${id}`);
    }
    catch (error) {
        if (error.message === 'Not Found Error' || error.message === 'Authorization Error') {
            return undefined;
        }
        throw error;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    const { fields, records } = result
    const rows = fields
        .map(e => e.id)
        .filter(e => e !== '_id')
    return { rows, records };
}

async function requestAllData() {
    const csvPath = 'tables.csv'
    const ids = await getIds()

    let i = 0;

    for (id of ids) {
        i++;
        if (i < 0) {
            continue;
        }
        const metadata = await getMetadata(id);
        if (!metadata) {
            continue;
        }
        const data = await getData(id);
        appendEntryToCSV(csvPath, [ id, metadata.name, metadata.format, metadata.atlas,  ...data.rows]);

        const fileName = metadata.name.replace(/[^\w\s\döüäÖÜÄ]/g, '')

        fs.writeFile(`data/${fileName}.json`, JSON.stringify(data.records, null, 2))
        fs.writeFile(`descriptions/${fileName}.txt`, metadata.description)
        console.log(`(${i}) Created ${fileName}.json`)
    }

}

requestAllData()