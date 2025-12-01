import { Request, Response } from 'express';
import { CmsService } from '../services/cms.service';

export class CmsController {

    static async getPage(req: Request, res: Response) {
        try {
            const { slug } = req.params;
            const page = await CmsService.getPageBySlug(slug);
            if (!page) return res.status(404).json({ error: 'Page not found' });
            res.json(page);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async savePage(req: Request, res: Response) {
        try {
            const result = await CmsService.savePage(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async listPages(req: Request, res: Response) {
        try {
            const pages = await CmsService.listPages();
            res.json(pages);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async togglePublish(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { is_published } = req.body;
            const result = await CmsService.togglePublish(id, is_published);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
