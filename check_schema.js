import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSchema() {
    console.log('Checking artworks table schema...');
    const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching artwork:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
        if (Object.keys(data[0]).includes('description')) {
            console.log('SUCCESS: "description" column is visible to the API.');
        } else {
            console.log('FAILURE: "description" column is NOT found in the result keys.');
        }
    } else {
        console.log('No data found in artworks table to check keys.');
    }
}

checkSchema();
