import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function heal() {
    console.log('Fetching all artworks...');
    const { data: artworks, error } = await supabase.from('artworks').select('id, title').order('created_at', { ascending: false });
    if (error) {
        console.error('Fetch error:', error);
        return;
    }

    console.log(`Found ${artworks.length} artworks. Renumbering...`);

    // Update sequentially
    for (let i = 0; i < artworks.length; i++) {
        const { error: updateError } = await supabase
            .from('artworks')
            .update({ sort_order: i })
            .match({ id: artworks[i].id });

        if (updateError) {
            console.error(`Failed to update ${artworks[i].title}`, updateError);
        } else {
            process.stdout.write('.');
        }
    }
    console.log('\nDone! All artworks have unique sort_order.');
}

heal();
