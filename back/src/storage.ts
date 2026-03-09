import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
    if (supabase) return supabase;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key || url === 'https://your-project.supabase.co') {
        console.warn('⚠️  Supabase Storage not configured — photo uploads will be skipped');
        return null;
    }

    supabase = createClient(url, key);
    return supabase;
}

export async function uploadToSupabase(
    file: Express.Multer.File,
    tripId: string
): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'trip-photos';
    const ext = path.extname(file.originalname) || '.jpg';
    const fileName = `${tripId}/${uuidv4()}${ext}`;

    const { error } = await client.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if (error) {
        console.error('Supabase upload error:', error);
        return null;
    }

    const { data } = client.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
}
