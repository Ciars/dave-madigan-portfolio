import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Trash2, Plus, UploadCloud, X, Loader2, Folder, Image as ImageIcon, ChevronRight, ArrowLeft, GripVertical, Layers, Grid } from 'lucide-react';
import { Reorder, motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ArtworkManager() {
    // view modes: 'root', 'folder', 'flat' -> 'flat' is effectively deprecated or just a readonly view now. 
    // We will focus on 'root' and 'folder' for the Playlist system.
    const [view, setView] = useState('root');
    const [currentCollection, setCurrentCollection] = useState(null); // { id, title, artwork_order }

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Upload & Create Modal
    const [showUpload, setShowUpload] = useState(false);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        fetchContent();
    }, [view, currentCollection?.id]); // Depend on ID to allow refresh

    const fetchContent = async () => {
        setLoading(true);
        setHasUnsavedChanges(false);
        try {
            if (view === 'root') {
                // 1. Fetch Manifest (Root Order)
                const { data: config } = await supabase.from('site_config').select('root_structure').eq('id', 1).single();
                const manifest = config?.root_structure || [];

                // 2. Fetch All Candidates
                const { data: collections } = await supabase.from('collections').select('*');
                const { data: artworks } = await supabase.from('artworks').select('*').is('collection_id', null);

                // 3. Map items for easy lookup
                const itemMap = new Map();
                collections?.forEach(c => itemMap.set(`collection:${c.id}`, { ...c, type: 'folder', manifestId: `collection:${c.id}` }));
                artworks?.forEach(a => itemMap.set(`artwork:${a.id}`, { ...a, type: 'file', manifestId: `artwork:${a.id}` }));

                // 4. Construct Order from Manifest
                const orderedItems = [];
                const seenKeys = new Set();

                // Add Manifest items first
                manifest.forEach(key => {
                    if (itemMap.has(key)) {
                        orderedItems.push(itemMap.get(key));
                        seenKeys.add(key);
                    }
                });

                // Add Orphans (New items not yet in manifest, or DB drifts)
                itemMap.forEach((item, key) => {
                    if (!seenKeys.has(key)) {
                        orderedItems.push(item);
                    }
                });

                setItems(orderedItems);

            } else if (view === 'folder' && currentCollection) {
                // 1. Fetch Current Collection Manifest
                // We re-fetch to ensure we have latest order
                const { data: col } = await supabase.from('collections').select('*').eq('id', currentCollection.id).single();
                if (!col) throw new Error("Collection not found");

                const manifest = col.artwork_order || [];
                setCurrentCollection(col); // Update state with latest

                // 2. Fetch Children
                const { data: artworks } = await supabase.from('artworks').select('*').eq('collection_id', col.id);

                // 3. Map
                const itemMap = new Map();
                artworks?.forEach(a => itemMap.set(a.id, { ...a, type: 'file' }));

                // 4. Construct
                const orderedItems = [];
                const seenIds = new Set();

                manifest.forEach(id => {
                    if (itemMap.has(id)) {
                        orderedItems.push(itemMap.get(id));
                        seenIds.add(id);
                    }
                });

                // Orphans
                itemMap.forEach((item, id) => {
                    if (!seenIds.has(id)) {
                        orderedItems.push(item);
                    }
                });

                setItems(orderedItems);
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            toast.error('Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName) return;

        // 1. Create Collection
        const { data: newCol, error } = await supabase
            .from('collections')
            .insert([{ title: newFolderName, artwork_order: [] }])
            .select()
            .single();

        if (error) {
            toast.error('Failed to create collection');
            return;
        }

        // 2. Update Root Manifest (Append new folder)
        // We fetch fresh config to be safe
        const { data: config } = await supabase.from('site_config').select('root_structure').eq('id', 1).single();
        const currentManifest = config?.root_structure || [];
        const newManifest = [...currentManifest, `collection:${newCol.id}`];

        const { error: updateError } = await supabase
            .from('site_config')
            .update({ root_structure: newManifest })
            .eq('id', 1);

        if (updateError) {
            console.error("Failed to update manifest", updateError);
            // Warn user but don't crash, the orphan logic will show it anyway
        }

        toast.success('Collection created');
        setNewFolderName('');
        setShowCreateFolder(false);
        fetchContent();
    };

    const handleReorder = (newOrder) => {
        setItems(newOrder);
        setHasUnsavedChanges(true);
    };

    const saveOrder = async () => {
        const toastId = toast.loading('Saving order...');

        try {
            if (view === 'root') {
                // Save to site_config.root_structure
                // Map items to "collection:ID" or "artwork:ID"
                const newManifest = items.map(item =>
                    item.type === 'folder' ? `collection:${item.id}` : `artwork:${item.id}`
                );

                await supabase
                    .from('site_config')
                    .update({ root_structure: newManifest })
                    .eq('id', 1);

            } else if (view === 'folder' && currentCollection) {
                // Save to collections.artwork_order
                // Map items to IDs (int)
                const newManifest = items.map(item => item.id);

                await supabase
                    .from('collections')
                    .update({ artwork_order: newManifest })
                    .eq('id', currentCollection.id);
            }

            toast.success('Order saved', { id: toastId });
            setHasUnsavedChanges(false);
            fetchContent();

        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save order: ' + error.message, { id: toastId });
        }
    };

    const cancelReorder = () => {
        fetchContent();
        toast.info('Reorder cancelled');
    };

    const enterFolder = (folder) => {
        if (hasUnsavedChanges) {
            if (!window.confirm('You have unsaved reorder changes. Discard them?')) return;
        }
        setCurrentCollection(folder); // Will trigger effect
        setView('folder');
    };

    const goUp = () => {
        if (hasUnsavedChanges) {
            if (!window.confirm('You have unsaved reorder changes. Discard them?')) return;
        }
        setView('root');
        setCurrentCollection(null);
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${item.title}"?`)) return;

        const table = item.type === 'folder' ? 'collections' : 'artworks';
        const { error } = await supabase.from(table).delete().match({ id: item.id });

        if (error) {
            toast.error('Failed to delete item');
        } else {
            toast.success('Item deleted');
            // Note: We don't strictly need to remove it from the manifest JSON; 
            // the fetch logic filters out missing items automatically.
            fetchContent();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sticky top-0 bg-[#FDFBF7]/95 backdrop-blur z-40 pb-4 pt-2 -mt-2 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xl font-serif">
                    <button
                        onClick={goUp}
                        disabled={view === 'root'}
                        className={`hover:bg-gray-100 p-1 rounded transition-colors ${view === 'root' ? 'text-gray-900 cursor-default' : 'text-gray-400 hover:text-black'}`}
                    >
                        Portfolio
                    </button>
                    {view === 'folder' && (
                        <>
                            <ChevronRight size={18} className="text-gray-300" />
                            <span className="font-bold">{currentCollection?.title}</span>
                        </>
                    )}
                </div>

                <div className="flex gap-2">
                    {hasUnsavedChanges ? (
                        <>
                            <button onClick={cancelReorder} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">Cancel</button>
                            <button onClick={saveOrder} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 shadow-lg shadow-green-600/20">Save Order</button>
                        </>
                    ) : (
                        <>
                            {view === 'root' && (
                                <button onClick={() => setShowCreateFolder(true)} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                    <Plus size={16} /> New Collection
                                </button>
                            )}
                            <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 shadow-lg shadow-black/10">
                                <UploadCloud size={16} /> Upload Images
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* List */}
            {
                loading ? (
                    <div className="flex justify-center py-24"><Loader2 className="animate-spin opacity-20" size={32} /></div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Folder size={48} className="mb-4 opacity-20" />
                        <p>This folder is empty.</p>
                    </div>
                ) : (
                    <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
                        {items.map(item => (
                            <Reorder.Item key={`${item.type}-${item.id}`} value={item}>
                                <div className={`
                                group relative flex items-center gap-4 p-3 rounded-lg border transition-all duration-200
                                ${item.type === 'folder' ? 'bg-white border-gray-200 hover:border-black/20 hover:shadow-sm' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200'}
                            `}>
                                    <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500"><GripVertical size={18} /></div>
                                    <div
                                        onClick={() => item.type === 'folder' && enterFolder(item)}
                                        className={`w-12 h-12 flex items-center justify-center rounded overflow-hidden cursor-pointer ${item.type === 'folder' ? 'bg-blue-50 text-blue-500' : 'bg-gray-200'}`}
                                    >
                                        {item.type === 'folder' ? <Folder size={24} fill="currentColor" className="opacity-20" /> : <img src={item.image_url} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 cursor-pointer" onClick={() => item.type === 'folder' && enterFolder(item)}>
                                        <h3 className="font-medium text-sm">{item.title}</h3>
                                        <p className="text-xs text-gray-400">{item.type === 'folder' ? 'Collection' : item.medium || 'Artwork'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDelete(item)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                )
            }

            {/* Models */}
            {showCreateFolder && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
                        <h3 className="font-serif text-lg mb-4">New Collection</h3>
                        <form onSubmit={handleCreateFolder}>
                            <input autoFocus placeholder="Name" className="w-full border border-gray-200 rounded-lg p-3 mb-4 outline-none focus:border-black" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowCreateFolder(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
                                <button disabled={!newFolderName} className="bg-black text-white px-4 py-2 rounded-lg text-sm">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showUpload && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-left">
                    <UploadModal
                        onClose={() => setShowUpload(false)}
                        collectionId={currentCollection?.id}
                        onSuccess={fetchContent}
                    />
                </div>
            )}
        </div >
    );
}

function UploadModal({ onClose, collectionId, onSuccess }) {
    const [uploading, setUploading] = useState(false);
    const [stagedFiles, setStagedFiles] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [medium, setMedium] = useState('Oil on Canvas');

    const handleFileSelect = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file, preview: URL.createObjectURL(file), title: file.name.split('.')[0].replace(/[-_]/g, ' ')
            }));
            setStagedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleBatchUpload = async () => {
        if (stagedFiles.length === 0) return;
        setUploading(true);
        const toastId = toast.loading('Starting upload...');

        try {
            // New items to append to manifest
            const newIds = [];
            let successCount = 0;

            for (let i = 0; i < stagedFiles.length; i++) {
                const item = stagedFiles[i];
                toast.loading(`Uploading ${i + 1}/${stagedFiles.length}`, { id: toastId });

                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${item.file.name.split('.').pop()}`;
                await supabase.storage.from('artworks').upload(fileName, item.file);
                const { data: { publicUrl } } = supabase.storage.from('artworks').getPublicUrl(fileName);

                const { data: newArt, error } = await supabase.from('artworks').insert([{
                    title: item.title, year, medium, collection_id: collectionId || null, image_url: publicUrl, sort_order: 0 // Legacy field ignored
                }]).select().single();

                if (!error && newArt) {
                    newIds.push(newArt.id);
                    successCount++;
                }
            }

            // Append to Manifest
            if (successCount > 0) {
                if (collectionId) {
                    const { data: col } = await supabase.from('collections').select('artwork_order').eq('id', collectionId).single();
                    const currentOrder = col?.artwork_order || [];
                    const newOrder = [...currentOrder, ...newIds]; // Append
                    await supabase.from('collections').update({ artwork_order: newOrder }).eq('id', collectionId);
                } else {
                    const { data: cfg } = await supabase.from('site_config').select('root_structure').eq('id', 1).single();
                    const currentRoot = cfg?.root_structure || [];
                    const newRoot = [...currentRoot, ...newIds.map(id => `artwork:${id}`)];
                    await supabase.from('site_config').update({ root_structure: newRoot }).eq('id', 1);
                }
            }

            toast.success('Upload complete', { id: toastId });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Upload failed', { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center"><h2 className="text-xl font-serif">Upload</h2><button onClick={onClose}><X /></button></div>
            <div className="flex-1 overflow-auto p-6 flex gap-6">
                <div className="w-1/3 space-y-4">
                    <input className="w-full p-2 border rounded" value={year} onChange={e => setYear(e.target.value)} placeholder="Year" />
                    <input className="w-full p-2 border rounded" value={medium} onChange={e => setMedium(e.target.value)} placeholder="Medium" />
                    <label className="block border-2 border-dashed h-32 flex items-center justify-center cursor-pointer hover:bg-gray-50 rounded-xl"><input type="file" multiple hidden onChange={handleFileSelect} />Add Files</label>
                </div>
                <div className="flex-1 space-y-2">
                    {stagedFiles.map((f, i) => (
                        <div key={i} className="flex gap-4 items-center p-2 border rounded"><img src={f.preview} className="w-10 h-10 rounded object-cover" /> <span className="text-sm font-medium">{f.title}</span></div>
                    ))}
                    {stagedFiles.length === 0 && <p className="text-gray-400 text-center mt-10">No files</p>}
                </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 text-gray-500">Cancel</button><button onClick={handleBatchUpload} disabled={uploading} className="bg-black text-white px-6 py-2 rounded">Upload</button></div>
        </div>
    )
}
