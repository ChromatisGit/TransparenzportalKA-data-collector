const fs = require('fs')

async function request(uri) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    try {
        const response = await fetch(uri)
        const text = await response.text();
        if(response.status !== 200 && response.status !== 404) {
            console.error(text)
        }
        return text
    }
    catch {
        console.error(`Some error: ${uri}`)
        return "\n"
    }
}

async function requestRows() {
    const rows = JSON.parse(fs.readFileSync('CSV.json', 'utf8'));
    let i = 0;
    for (e of rows) {
        const data = await request(e.source)
        const cols = data.split('\n')[0]
        fs.promises.appendFile('rows.csv', `${e.id},${cols}`, 'utf8');
        console.log(i++)
    }
}


requestRows()