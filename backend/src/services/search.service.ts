import { query } from '../config/database';

interface SearchResult {
    type: 'product' | 'order' | 'user' | 'page';
    id: string;
    title: string;
    subtitle?: string;
    url: string;
    metadata?: any;
}

export class SearchService {

    // Global Search (Aggregated)
    static async globalSearch(term: string): Promise<SearchResult[]> {
        if (!term || term.length < 2) return [];

        const results: SearchResult[] = [];
        const searchTerm = `%${term}%`;

        // 1. Search Products
        const products = await query(
            `SELECT id, name, sku, category FROM products 
             WHERE name ILIKE $1 OR sku ILIKE $1 OR category ILIKE $1 
             LIMIT 5`,
            [searchTerm]
        );
        products.rows.forEach(p => results.push({
            type: 'product',
            id: p.id.toString(),
            title: p.name,
            subtitle: `SKU: ${p.sku} • ${p.category}`,
            url: `/admin/products?id=${p.id}`
        }));

        // 2. Search Orders
        const orders = await query(
            `SELECT id, status, user_id FROM orders 
             WHERE id ILIKE $1 
             LIMIT 5`,
            [searchTerm]
        );
        orders.rows.forEach(o => results.push({
            type: 'order',
            id: o.id,
            title: `Order #${o.id}`,
            subtitle: `Status: ${o.status}`,
            url: `/admin/orders/${o.id}`
        }));

        // 3. Search Users
        const users = await query(
            `SELECT id, name, email, phone FROM users 
             WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 
             LIMIT 3`,
            [searchTerm]
        );
        users.rows.forEach(u => results.push({
            type: 'user',
            id: u.id.toString(),
            title: u.name,
            subtitle: `${u.email} • ${u.phone}`,
            url: `/admin/users/${u.id}`
        }));

        // 4. Navigation / Pages (Static)
        const pages = [
            { title: 'Inventory Dashboard', url: '/admin/inventory', keywords: ['stock', 'inventory', 'warehouse'] },
            { title: 'Sales Report', url: '/admin/finance', keywords: ['sales', 'revenue', 'finance', 'money'] },
            { title: 'Settings', url: '/dashboard/settings', keywords: ['config', 'profile', 'account'] },
            { title: 'AI Worker', url: '/admin/ai', keywords: ['ai', 'bot', 'help', 'assistant'] }
        ];

        pages.forEach(page => {
            if (page.title.toLowerCase().includes(term.toLowerCase()) ||
                page.keywords.some(k => k.includes(term.toLowerCase()))) {
                results.push({
                    type: 'page',
                    id: page.url,
                    title: page.title,
                    subtitle: 'Navigation',
                    url: page.url
                });
            }
        });

        return results;
    }
}
