const https = require('https');
const fs = require('fs');
const path = require('path');

const SERVICE_ID = 'srv-d6a8phi48b3s73ae38fg';
const API_KEY = 'rnd_aGALvgJdKUmU0dynL8spWxJQgHgq';
const DEPLOY_ID_FILE = path.join(__dirname, '../deploy_trigger.txt');

function request(path_val) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.render.com',
            path: `/v1${path_val}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
                } else {
                    reject(new Error(`Request failed (${res.statusCode}): ${data}`));
                }
            });
        });
        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function main() {
    try {
        if (!fs.existsSync(DEPLOY_ID_FILE)) {
            throw new Error(`Deploy ID file not found: ${DEPLOY_ID_FILE}`);
        }
        let deployIdVal = fs.readFileSync(DEPLOY_ID_FILE, 'utf8').trim();
        // Handle potential UTF-16LE or other encoding issues
        try {
            if (deployIdVal.indexOf('\0') !== -1) {
                deployIdVal = fs.readFileSync(DEPLOY_ID_FILE, 'utf16le').trim();
            }
        } catch (e) { }

        // Remove "trigger deploy" text if present (legacy content)
        if (deployIdVal === 'trigger deploy') {
            console.log('No active deployment ID in file (found "trigger deploy").');
            process.exit(0);
        }

        console.log(`Checking status for deploy: ${deployIdVal}`);
        const response = await request(`/services/${SERVICE_ID}/deploys/${deployIdVal}`);
        console.log(`Status: ${response.status} | Updated: ${response.updatedAt}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}
main();
