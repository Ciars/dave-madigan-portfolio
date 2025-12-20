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

async function verifySort() {
    console.log('🔍 Verifying Sort Order Values...');

    const { data, error } = await supabase
        .from('artworks')
        .select('title, sort_order')
        .not('collection_id', 'is', null) // Check children first
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Sample Data:');
    data.forEach(item => {
        console.log(`- ${item.title}: ${item.sort_order}`);
    });

    // Check if they are integers or floats
    const isFloat = data.some(d => d.sort_order % 1 !== 0);
    if (isFloat) {
        console.log('✅ SUCCESS: Decimals are preserved. Column is likely float8.');
    } else {
        console.log('❌ WARNING: All values are integers. Column might still be int8 type!');
    }
}

verifySort();
