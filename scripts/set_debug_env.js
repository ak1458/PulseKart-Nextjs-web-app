
const https = require('https');

const SERVICE_ID = 'srv-d6a8phi48b3s73ae38fg';
const API_KEY = 'rnd_aGALvgJdKUmU0dynL8spWxJQgHgq';

function request(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.render.com',
            path: `/v1${path}`,
            method: method,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function main() {
    try {
        console.log('Setting DB_SYNC=false and NODE_ENV=development...');
        const body = [
            { key: 'DB_SYNC', value: 'false' },
            { key: 'NODE_ENV', value: 'production' }
        ];

        const response = await request(`/services/${SERVICE_ID}/env-vars`, 'PUT', body);
        console.log('Environment variables updated:', JSON.stringify(response, null, 2));

    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

main();
