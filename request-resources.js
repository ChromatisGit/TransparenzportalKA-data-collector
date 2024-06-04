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
    await new Promise(resolve => setTimeout(resolve, 500))
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

async function requestAllData() {
    const csvResourcePath = 'resources.csv'
    const csvPackagePath = 'packages.csv'
    const packages = await request("https://transparenz.karlsruhe.de/api/3/action/package_list")

    let i = 0;

    for (packageName of packages) {
        i++;
        const package = await request(`https://transparenz.karlsruhe.de/api/3/action/package_show?id=${packageName}`)

        package.resources.forEach(resource => {
            appendEntryToCSV(csvResourcePath, [packageName, resource.name, resource.url, resource.format, resource.id ]);
            //resource.description
        })

        const groups = package.groups.map(g => g.name)

        appendEntryToCSV(csvPackagePath, [ packageName, package.title, ...groups]);
        //package.notes

        console.log(`(${i}) Got package: ${packageName}`)
    }

}

requestAllData()