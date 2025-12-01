import { Request, Response } from 'express';
import { SearchService } from '../services/search.service';

export class SearchController {

    static async globalSearch(req: Request, res: Response) {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string') {
                return res.status(400).json({ error: 'Query parameter "q" is required' });
            }

            const results = await SearchService.globalSearch(q);
            res.json({ results });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
