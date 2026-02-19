
const https = require('https');

const SERVICE_ID = 'srv-d6a8phi48b3s73ae38fg';
const API_KEY = 'rnd_aGALvgJdKUmU0dynL8spWxJQgHgq';
const TARGET_DEPLOY_ID = 'dep-d6bboffpm1nc739h28fg';

function request(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.render.com',
            path: `/v1${path}`,
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
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
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
        console.log(`Searching for info on deploy ${TARGET_DEPLOY_ID}...`);
        const events = await request(`/services/${SERVICE_ID}/events?limit=50`);

        const deployEvents = events.filter(e => e.event.details && e.event.details.deployId === TARGET_DEPLOY_ID);

        console.log(JSON.stringify(deployEvents, null, 2));

    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

main();
