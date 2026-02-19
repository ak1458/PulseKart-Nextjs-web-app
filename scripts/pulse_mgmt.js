const https = require('https');
const fs = require('fs');
const path = require('path');

const SERVICE_ID = 'srv-d6a8phi48b3s73ae38fg';
const API_KEY = 'rnd_aGALvgJdKUmU0dynL8spWxJQgHgq';
const TRIGGER_FILE = path.join(__dirname, '../deploy_trigger.txt');

function readTextSafely(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const buf = fs.readFileSync(filePath);
    // Check for UTF-16LE BOM or null bytes
    if (buf.length >= 2 && (buf[0] === 0xff && buf[1] === 0xfe)) {
        return buf.toString('utf16le').trim();
    }
    const content = buf.toString('utf8');
    if (content.includes('\0')) {
        return buf.toString('utf16le').trim();
    }
    return content.trim();
}

function request(path_val, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.render.com',
            path: `/v1${path_val}`,
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
                    try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
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
    const action = process.argv[2];
    try {
        switch (action) {
            case 'deploy':
                console.log('🚀 Triggering manual deployment...');
                const deploy = await request(`/services/${SERVICE_ID}/deploys`, 'POST', { clearCache: 'do_not_clear' });
                console.log(`Deployment triggered: ${deploy.id}`);
                fs.writeFileSync(TRIGGER_FILE, deploy.id);
                break;
            case 'monitor':
                const deployId = readTextSafely(TRIGGER_FILE);
                if (!deployId) throw new Error('No deployment ID found in trigger file.');
                console.log(`🔍 Monitoring deploy: ${deployId}`);
                const status = await request(`/services/${SERVICE_ID}/deploys/${deployId}`);
                console.log(`Status: ${status.status} | Updated: ${status.updatedAt}`);
                break;
            case 'set-debug':
                console.log('🛠 Setting DEBUG env vars...');
                await request(`/services/${SERVICE_ID}/env-vars`, 'PUT', [
                    { key: 'DB_SYNC', value: 'false' },
                    { key: 'NODE_ENV', value: 'development' }
                ]);
                console.log('Environment updated.');
                break;
            default:
                console.log('Usage: node scripts/pulse_mgmt.js [deploy|monitor|set-debug]');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}
main();
