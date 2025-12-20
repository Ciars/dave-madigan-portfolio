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

async function healDecimalSort() {
    console.log('🩹 Starting Decimal Sort Healing...');

    // 1. Fetch All Collections
    // We sort them by their CURRENT sort_order (or created_at if null) to preserve roughly what the user has.
    const { data: collections, error: cError } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

    if (cError) {
        console.error('Error fetching collections:', cError);
        return;
    }

    console.log(`Found ${collections.length} collections.`);

    // 2. Assign Whole Numbers to Collections (100, 200, 300...)
    // Limit: Max 999 items per folder before collision? No, 1000 items is good. 
    // Actually, let's use 100 gap. 100, 200. Leaves room for 99 items logic safely.
    // If we want more robust, 1000 gap? 1000, 2000. 
    // Let's stick to 1.0, 2.0 logic? No, JS floats are fine.
    // Plan: Collections = Index * 100. (0 is Root Files? No, let's start Collections at 100).

    let currentGlobalIndex = 100;

    for (const collection of collections) {
        const newSortOrder = currentGlobalIndex;
        console.log(`Processing Collection: "${collection.title}" -> Assigning Order ${newSortOrder}`);

        // Update Collection Sort Order
        await supabase
            .from('collections')
            .update({ sort_order: newSortOrder })
            .eq('id', collection.id);

        // 3. Process Children of this Collection
        const { data: children, error: aError } = await supabase
            .from('artworks')
            .select('*')
            .eq('collection_id', collection.id)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true });

        if (aError) console.error('Error fetching children:', aError);

        if (children && children.length > 0) {
            console.log(`  - Found ${children.length} items.`);
            // Assign Decimals: newSortOrder + 0.001 * (index + 1)
            // Example: 100.001, 100.002

            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const decimalPart = (i + 1) * 0.001;
                const childSortOrder = newSortOrder + decimalPart;

                // console.log(`    - Item "${child.title}" -> ${childSortOrder.toFixed(3)}`);

                await supabase
                    .from('artworks')
                    .update({ sort_order: childSortOrder })
                    .eq('id', child.id);
            }
        }

        currentGlobalIndex += 100;
    }

    // 4. Handle Root Artworks (No Collection)
    // Should they be at the very top (0-99) or bottom?
    // User said "Folders first" in root view previously.
    // But currently user might have files mixed.
    // Let's put Root files at the END for safety, or at 0?
    // Let's put them at the END to avoid hiding them behind folders if that was the intent.
    // Actually, "Folders First" was a requirement. So Root Files should come AFTER folders?
    // Wait, "Folders First" means Folders appear at top. So Root Files appear *after*.
    // So if Collections went 100...500, Root Files start at 600.

    const { data: rootArtworks, error: rError } = await supabase
        .from('artworks')
        .select('*')
        .is('collection_id', null)
        .order('sort_order', { ascending: true });

    if (rError) console.error('Error fetching root artworks:', rError);

    if (rootArtworks && rootArtworks.length > 0) {
        console.log(`Found ${rootArtworks.length} root artworks. Appending to end.`);

        // Start after the last collection
        let rootIndex = currentGlobalIndex; // e.g. 600

        for (let i = 0; i < rootArtworks.length; i++) {
            const art = rootArtworks[i];
            const newOrder = rootIndex + (i + 1); // Whole numbers for root items?
            // Root items are effectively top-level items, so they get whole numbers like folders?
            // Yes.

            // console.log(`  - Root Item "${art.title}" -> ${newOrder}`);
            await supabase
                .from('artworks')
                .update({ sort_order: newOrder })
                .eq('id', art.id);
        }
    }

    console.log('✅ Healing Complete!');
}

healDecimalSort();
