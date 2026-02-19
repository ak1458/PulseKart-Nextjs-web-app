
const BASE_URL = 'https://pulsekart-api.onrender.com';
const ADMIN_EMAIL = 'admin@pulse-kart.com';
const ADMIN_PASSWORD = 'a4800ea1-d9b9-48b6-9e8f-9bf42f9a8480Admin!';

const CUSTOMER_EMAIL = `test.customer.${Date.now()}@example.com`;
const CUSTOMER_PASSWORD = 'Password123!';

let adminToken = '';
let customerToken = '';
let customerId = '';
let createdProductId = null;
let createdOrderId = null;

async function request(method, path, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log(`\n🔹 ${method} ${path}`);
    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`${method} ${path} failed (${response.status}): ${JSON.stringify(data)}`);
    }
    return data;
}

async function main() {
    console.log('🚀 Starting PulseKart Live API Logic Test');
    console.log('=======================================');

    try {
        // ----------------------------------------------------------------
        // 1. Admin Login
        // ----------------------------------------------------------------
        console.log('\n🔐 [1/6] Admin Authenticating...');
        try {
            const adminAuth = await request('POST', '/v1/auth/login', {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            });
            console.log('Admin Auth Response:', JSON.stringify(adminAuth, null, 2));
            adminToken = adminAuth.access_token || adminAuth.accessToken || adminAuth.token;
            console.log('Extracted Admin Token:', adminToken ? 'Present' : 'Missing');
            console.log('✅ Admin Logged In');
        } catch (e) {
            console.error('⚠️ Admin Login Failed:', e.message);
            console.log('⚠️ Proceeding to check if basic API/DB works via Customer Registration...');
        }

        // ----------------------------------------------------------------
        // 2. Create Product (Admin)
        // ----------------------------------------------------------------
        if (adminToken) {
            console.log('\n📦 [2/6] creating Test Product...');
            const productPayload = {
                sku: `TEST-${Date.now()}`,
                title: 'Test Live Product',
                category: 'Electronics',
                description: 'A test product created by the CLI verify script',
                price: 50.00,
                mrp: 60.00,
                stock: 100,
                images: ['https://via.placeholder.com/150'],
                attributes: { color: 'red' }
            };

            const product = await request('POST', '/v1/products', productPayload, adminToken);
            createdProductId = product.id;
            console.log(`✅ Product Created: ID ${product.id} (${product.sku})`);
        } else {
            console.log('\n⏩ Skipping [2/6] Create Product (No Admin Token)');
        }

        // ----------------------------------------------------------------
        // 3. Customer Registration & Login
        // ----------------------------------------------------------------
        console.log('\n👤 [3/6] Registering New Customer...');
        const customerRegister = await request('POST', '/v1/auth/register', {
            email: CUSTOMER_EMAIL,
            password: CUSTOMER_PASSWORD,
            name: 'Test Customer',
            phone: '1234567890'
        });
        console.log('✅ Customer Registered');

        console.log('🔐 Logging in as Customer...');
        const customerAuth = await request('POST', '/v1/auth/login', {
            email: CUSTOMER_EMAIL,
            password: CUSTOMER_PASSWORD
        });
        console.log('Customer Auth Response:', JSON.stringify(customerAuth, null, 2));
        customerToken = customerAuth.access_token || customerAuth.accessToken || customerAuth.token;
        console.log('Extracted Customer Token:', customerToken ? 'Present' : 'Missing');
        customerId = customerAuth.user?.id || customerAuth.userId; // Adjust based on actual response structure
        console.log('✅ Customer Logged In');

        // ----------------------------------------------------------------
        // 4. Place Order (Customer)
        // ----------------------------------------------------------------
        console.log('\n🛒 [4/6] Placing Order...');
        const orderPayload = {
            userId: Number(customerId), // DTO expects number
            items: [
                {
                    productId: Number(createdProductId), // DTO expects number
                    quantity: 2,
                    price: 50.00,
                    name: 'Test Live Product'
                }
            ],
            totalAmount: 100.00,
            status: 'created',
            paymentStatus: 'pending',
            shippingAddress: {
                street: '123 Test St',
                city: 'Test City',
                country: 'Testland'
            }
        };

        const order = await request('POST', '/v1/orders', orderPayload, customerToken);
        createdOrderId = order.id;
        console.log(`✅ Order Placed: ID ${order.id} - Total: ${order.totalAmount}`);

        // ----------------------------------------------------------------
        // 5. Verify Order (Admin)
        // ----------------------------------------------------------------
        console.log('\n👁️ [5/6] Admin Verifying Order...');
        const orderDetails = await request('GET', `/v1/orders/${createdOrderId}`, null, adminToken);

        if (orderDetails.id === createdOrderId) {
            console.log(`✅ Admin verified Order #${orderDetails.id} exists`);
            console.log(`   Status: ${orderDetails.status}`);
            console.log(`   Customer: ${orderDetails.user?.name || 'N/A'}`);
        } else {
            console.error('❌ Order verification failed: ID mismatch');
        }

        // ----------------------------------------------------------------
        // 6. Cleanup
        // ----------------------------------------------------------------
        console.log('\n🧹 [6/6] Cleaning up...');
        if (createdProductId) {
            await request('DELETE', `/v1/products/${createdProductId}`, null, adminToken);
            console.log(`✅ Deleted Product ${createdProductId}`);
        }

        // Note: We leave the order/user for record, or we could implement delete endpoints for them too.
        // Usually deleting a user or order is specific.

        console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        if (error.cause) console.error(error.cause);
    }
}

main();
