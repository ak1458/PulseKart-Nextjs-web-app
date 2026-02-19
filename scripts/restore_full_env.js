
const https = require('https');
const fs = require('fs');
const path = require('path');

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
        console.log('Restoring environment variables...');

        // Read the backup env vars from file
        const envPath = path.join(__dirname, '..', 'env_vars_payload.json');
        const envVars = JSON.parse(fs.readFileSync(envPath, 'utf8'));

        // Transform them into the format Render expects for a PUT request (array of objects)
        // Ensure DB_SYNC is false for now to avoid startup crashes
        const finalEnvVars = envVars.map(v => {
            if (v.key === 'DB_SYNC') return { key: 'DB_SYNC', value: 'false' };
            return v;
        });

        // Add DB_SYNC if not present
        if (!finalEnvVars.find(v => v.key === 'DB_SYNC')) {
            finalEnvVars.push({ key: 'DB_SYNC', value: 'false' });
        }

        console.log(`Sending ${finalEnvVars.length} environment variables to Render...`);

        const response = await request(`/services/${SERVICE_ID}/env-vars`, 'PUT', finalEnvVars);
        console.log('Environment variables restored:', JSON.stringify(response, null, 2));

    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

main();
