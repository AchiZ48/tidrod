import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

// GET /api/trips/:tripId/messages
router.get('/:tripId/messages', async (req: Request, res: Response): Promise<void> => {
    try {
        const { tripId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT m.id, m.content, m.created_at, m.user_id, u.username
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.trip_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2 OFFSET $3`,
            [tripId, limit, offset]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Get messages error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
