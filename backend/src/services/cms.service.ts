import { query } from '../config/database';

interface CreatePageDTO {
    slug: string;
    title: string;
    description?: string;
    blocks: {
        type: string;
        position: number;
        content: any;
    }[];
}

export class CmsService {

    // 1. Get Page by Slug (Public)
    static async getPageBySlug(slug: string) {
        const pageRes = await query('SELECT * FROM cms_pages WHERE slug = $1 AND is_published = true', [slug]);
        if (pageRes.rows.length === 0) return null;

        const page = pageRes.rows[0];
        const blocksRes = await query(
            'SELECT * FROM cms_blocks WHERE page_id = $1 AND is_active = true ORDER BY position ASC',
            [page.id]
        );

        return { ...page, blocks: blocksRes.rows };
    }

    // 2. Create/Update Page (Admin)
    static async savePage(data: CreatePageDTO) {
        try {
            await query('BEGIN');

            // Upsert Page
            let pageId;
            const existing = await query('SELECT id FROM cms_pages WHERE slug = $1', [data.slug]);

            if (existing.rows.length > 0) {
                pageId = existing.rows[0].id;
                await query(
                    'UPDATE cms_pages SET title = $1, description = $2, updated_at = NOW() WHERE id = $3',
                    [data.title, data.description, pageId]
                );
                // Clear existing blocks for full replace (simplest for MVP)
                await query('DELETE FROM cms_blocks WHERE page_id = $1', [pageId]);
            } else {
                const newPage = await query(
                    'INSERT INTO cms_pages (slug, title, description) VALUES ($1, $2, $3) RETURNING id',
                    [data.slug, data.title, data.description]
                );
                pageId = newPage.rows[0].id;
            }

            // Insert Blocks
            for (const block of data.blocks) {
                await query(
                    'INSERT INTO cms_blocks (page_id, type, position, content) VALUES ($1, $2, $3, $4)',
                    [pageId, block.type, block.position, JSON.stringify(block.content)]
                );
            }

            await query('COMMIT');
            return { id: pageId, slug: data.slug };

        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    }

    // 3. List Pages (Admin)
    static async listPages() {
        const result = await query('SELECT * FROM cms_pages ORDER BY updated_at DESC');
        return result.rows;
    }

    // 4. Toggle Publish
    static async togglePublish(id: string, isPublished: boolean) {
        const result = await query(
            'UPDATE cms_pages SET is_published = $1, published_at = $2 WHERE id = $3 RETURNING *',
            [isPublished, isPublished ? new Date() : null, id]
        );
        return result.rows[0];
    }
}
