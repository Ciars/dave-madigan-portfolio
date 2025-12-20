// debug_db_state.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("--- 1. SITE CONFIG (Root Manifest) ---");
    const { data: config, error: err1 } = await supabase.from('site_config').select('*').eq('id', 1);
    if (err1) console.error("Error:", err1);
    else console.log(JSON.stringify(config, null, 2));

    console.log("\n--- 2. COLLECTIONS (Sub Manifests) ---");
    const { data: cols, error: err2 } = await supabase.from('collections').select('id, title, artwork_order');
    if (err2) console.error("Error:", err2);
    else console.log(JSON.stringify(cols, null, 2));

    console.log("\n--- 3. ARTWORKS SAMPLE (Check IDs) ---");
    const { data: arts, error: err3 } = await supabase.from('artworks').select('id, title, collection_id').limit(5);
    if (err3) console.error("Error:", err3);
    else console.log(JSON.stringify(arts, null, 2));
}

inspect();
