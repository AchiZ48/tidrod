import { Router, Response } from 'express';
import multer from 'multer';
import pool from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { uploadToSupabase } from '../storage';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// GET /api/trips — list all trips (paginated)
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT t.id, t.title, t.description, t.latitude, t.longitude, t.created_at,
              u.username, u.id as user_id,
              (SELECT json_agg(json_build_object('id', tp.id, 'image_url', tp.image_url))
               FROM trip_photos tp WHERE tp.trip_id = t.id) as photos
       FROM trips t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await pool.query('SELECT COUNT(*) FROM trips');
        const total = parseInt(countResult.rows[0].count);

        res.json({
            trips: result.rows,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error('Get trips error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/trips/:id — single trip with photos
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT t.*, u.username, u.id as author_id,
              (SELECT json_agg(json_build_object('id', tp.id, 'image_url', tp.image_url))
               FROM trip_photos tp WHERE tp.trip_id = t.id) as photos
       FROM trips t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Trip not found' });
            return;
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get trip error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/trips — create trip (auth required)
router.post('/', authMiddleware, upload.array('photos', 10), async (req: AuthRequest, res: Response): Promise<void> => {
    const client = await pool.connect();
    try {
        const { title, description, latitude, longitude } = req.body;

        if (!title || latitude == null || longitude == null) {
            res.status(400).json({ error: 'Title, latitude, and longitude are required' });
            return;
        }

        await client.query('BEGIN');

        const tripResult = await client.query(
            'INSERT INTO trips (user_id, title, description, latitude, longitude) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user!.id, title, description || '', parseFloat(latitude), parseFloat(longitude)]
        );

        const trip = tripResult.rows[0];

        // Upload photos to Supabase Storage
        const files = req.files as Express.Multer.File[] | undefined;
        const photoUrls: string[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const url = await uploadToSupabase(file, trip.id);
                if (url) {
                    await client.query(
                        'INSERT INTO trip_photos (trip_id, image_url) VALUES ($1, $2)',
                        [trip.id, url]
                    );
                    photoUrls.push(url);
                }
            }
        }

        await client.query('COMMIT');

        res.status(201).json({
            ...trip,
            username: req.user!.username,
            photos: photoUrls.map((url, i) => ({ id: `temp-${i}`, image_url: url })),
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Create trip error:', err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

// DELETE /api/trips/:id — delete trip (auth, must be owner)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await pool.query('SELECT user_id FROM trips WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Trip not found' });
            return;
        }

        if (result.rows[0].user_id !== req.user!.id) {
            res.status(403).json({ error: 'Not authorized to delete this trip' });
            return;
        }

        await pool.query('DELETE FROM trips WHERE id = $1', [id]);
        res.json({ message: 'Trip deleted' });
    } catch (err) {
        console.error('Delete trip error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
