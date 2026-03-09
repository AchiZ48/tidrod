import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

// GET /api/markers?bbox=west,south,east,north
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { bbox } = req.query;

        if (!bbox || typeof bbox !== 'string') {
            res.status(400).json({ error: 'bbox parameter is required (format: west,south,east,north)' });
            return;
        }

        const parts = bbox.split(',').map(Number);
        if (parts.length !== 4 || parts.some(isNaN)) {
            res.status(400).json({ error: 'Invalid bbox format. Expected: west,south,east,north' });
            return;
        }

        const [west, south, east, north] = parts;

        const result = await pool.query(
            `SELECT t.id, t.title, t.latitude, t.longitude, t.created_at, u.username
       FROM trips t
       JOIN users u ON t.user_id = u.id
       WHERE t.longitude >= $1 AND t.longitude <= $3
         AND t.latitude >= $2 AND t.latitude <= $4
       LIMIT 200`,
            [west, south, east, north]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Get markers error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
