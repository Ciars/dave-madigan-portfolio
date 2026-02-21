import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { fallbackImages } from '../data/content';

export const useArtworks = () => {
    // Start with empty or fallback
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // 1. Fetch EVERYTHING needed
                const { data: config } = await supabase.from('site_config').select('root_structure').eq('id', 1).single();
                const { data: dividers } = await supabase.from('dividers').select('*');
                const { data: allArtworks } = await supabase.from('artworks').select('*');

                if (!config || !allArtworks) {
                    setArtworks(fallbackImages);
                    setLoading(false);
                    return;
                }

                // 2. Map for O(1) Lookup
                const divMap = new Map((dividers || []).map(d => [d.id, { ...d, type: 'divider' }]));
                const artMap = new Map((allArtworks || []).map(a => [a.id, { ...a, src: a.image_url, type: 'artwork' }]));

                // 3. Construct the Master List from Root Structure
                const rootManifest = config.root_structure || [];
                const seenArtIds = new Set();
                let orderedList = [];

                rootManifest.forEach(key => {
                    if (key.startsWith('divider:')) {
                        const divId = key.split(':')[1];
                        const div = divMap.get(divId);
                        if (div) orderedList.push(div);
                    } else if (key.startsWith('artwork:')) {
                        // Artworks use integer IDs
                        const artId = parseInt(key.split(':')[1]);
                        const art = artMap.get(artId);
                        if (art) {
                            orderedList.push(art);
                            seenArtIds.add(art.id);
                        }
                    }
                });

                // 4. Global Orphans (Artworks missing from manifest)
                allArtworks.forEach(art => {
                    if (!seenArtIds.has(art.id)) {
                        const fullArt = artMap.get(art.id);
                        if (fullArt) orderedList.push(fullArt);
                    }
                });

                setArtworks(orderedList);
            } catch (err) {
                console.error("Error building content:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    return { artworks, loading };
};

export const useExhibitions = () => {
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExhibitions = async () => {
            try {
                const { data, error } = await supabase
                    .from('exhibitions')
                    .select('*')
                    .order('year', { ascending: false })
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setExhibitions(data || []);
            } catch (err) {
                console.error("Error loading exhibitions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchExhibitions();
    }, []);

    // For now, setting currentExhibition to null to fall back to standard list
    // unless you want to add an 'is_current' flag to the database.
    return { exhibitions, currentExhibition: null, loading };
};
