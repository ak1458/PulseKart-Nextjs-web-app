
const https = require('https');

const SERVICE_ID = 'srv-d6a8phi48b3s73ae38fg';
const API_KEY = 'rnd_aGALvgJdKUmU0dynL8spWxJQgHgq';

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.render.com',
            path: `/v1${path}`,
            method: method,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
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
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    try {
        console.log('Fetching existing env vars...');
        const currentVarsResponse = await request('GET', `/services/${SERVICE_ID}/env-vars?limit=100`);
        const currentVars = currentVarsResponse.map(item => item.envVar);

        console.log(`Found ${currentVars.length} existing vars.`);

        // Filter out managed vars (if any distinction in API, usually PUT accepts them as overrides or ignores)
        // Actually, for PUT /env-vars, we should provide the full list.
        // But some vars like DATABASE_URL are managed.
        // Render docs: "PUT /services/{serviceId}/env-vars - Replaces the environment variables for a service."

        let newVars = [...currentVars];

        // Add or Update DB_SYNC
        const dbSyncIndex = newVars.findIndex(v => v.key === 'DB_SYNC');
        if (dbSyncIndex >= 0) {
            newVars[dbSyncIndex].value = 'true';
            console.log('Updated DB_SYNC to true');
        } else {
            newVars.push({ key: 'DB_SYNC', value: 'true' });
            console.log('Added DB_SYNC=true');
        }

        console.log('Updating env vars on Render...');
        await request('PUT', `/services/${SERVICE_ID}/env-vars`, newVars);
        console.log('✅ Successfully updated environment variables.');

    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

main();
