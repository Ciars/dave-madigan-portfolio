import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { fallbackImages, exhibitions, currentExhibition } from '../data/content';

export const useArtworks = () => {
    // Start with empty or fallback
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // 1. Fetch EVERYTHING needed
                const { data: config } = await supabase.from('site_config').select('root_structure').eq('id', 1).single();
                const { data: collections } = await supabase.from('collections').select('*');
                const { data: allArtworks } = await supabase.from('artworks').select('*');

                if (!config || !collections || !allArtworks) {
                    // Safety valve
                    setArtworks(fallbackImages);
                    setLoading(false);
                    return;
                }

                // 2. Map for O(1) Lookup
                const colMap = new Map(collections.map(c => [c.id, c]));
                const artMap = new Map(allArtworks.map(a => [a.id, { ...a, src: a.image_url }]));

                // 3. Construct the Master List from Root Structure
                const rootManifest = config.root_structure || [];
                const seenArtIds = new Set();
                let orderedList = [];

                rootManifest.forEach(key => {
                    if (key.startsWith('collection:')) {
                        // FIX: Collection IDs are UUID strings, NOT integers.
                        const colId = key.split(':')[1];
                        const collection = colMap.get(colId);

                        if (collection) {
                            // A. Add items from the Manifest (Explicit Order)
                            if (collection.artwork_order && Array.isArray(collection.artwork_order)) {
                                collection.artwork_order.forEach(artId => {
                                    const art = artMap.get(artId);
                                    if (art) {
                                        orderedList.push(art);
                                        seenArtIds.add(art.id);
                                    }
                                });
                            }

                            // B. Orphan Recovery (Safety Net)
                            // Find any artworks that usually belong to this collection but aren't in the manifest
                            allArtworks.forEach(art => {
                                if (art.collection_id === colId && !seenArtIds.has(art.id)) {
                                    // It belongs here!
                                    const fullArt = artMap.get(art.id);
                                    if (fullArt) {
                                        orderedList.push(fullArt);
                                        seenArtIds.add(art.id);
                                    }
                                }
                            });
                        }

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

                // C. Global Orphans (Root items missed by manifest)
                // Just in case there are root items not in the manifest
                allArtworks.forEach(art => {
                    if (!art.collection_id && !seenArtIds.has(art.id)) {
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
    return { exhibitions, currentExhibition };
};
