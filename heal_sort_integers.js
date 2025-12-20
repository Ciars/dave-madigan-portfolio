import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function healIntegerSort() {
    console.log('🩹 Starting Integer Sort Healing...');

    // 1. Heal Collections (0, 1, 2...)
    const { data: collections, error: cError } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

    if (cError) {
        console.error('Error:', cError);
        return;
    }

    console.log(`Processing ${collections.length} collections...`);
    for (let i = 0; i < collections.length; i++) {
        await supabase
            .from('collections')
            .update({ sort_order: i })
            .eq('id', collections[i].id);

        // 2. Heal Items inside Collection
        const { data: items } = await supabase
            .from('artworks')
            .select('*')
            .eq('collection_id', collections[i].id)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true });

        if (items) {
            for (let j = 0; j < items.length; j++) {
                await supabase
                    .from('artworks')
                    .update({ sort_order: j })
                    .eq('id', items[j].id);
            }
        }
    }

    // 3. Heal Root Artworks
    const { data: rootItems } = await supabase
        .from('artworks')
        .select('*')
        .is('collection_id', null)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

    if (rootItems) {
        console.log(`Processing ${rootItems.length} root items...`);
        for (let k = 0; k < rootItems.length; k++) {
            await supabase
                .from('artworks')
                .update({ sort_order: k })
                .eq('id', rootItems[k].id);
        }
    }

    console.log('✅ Integer Healing Complete!');
}

healIntegerSort();
