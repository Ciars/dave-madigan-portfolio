import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Trash2, Plus, UploadCloud, X, Loader2, Folder, Image as ImageIcon, ChevronRight, ArrowLeft, GripVertical, Layers, Grid } from 'lucide-react';
import { Reorder, motion, useDragControls } from 'framer-motion';
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
    const [editingItem, setEditingItem] = useState(null); // { id, title, medium, year, image_url }


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
        // Deep equality check to prevent accidental triggers
        const currentIds = items.map(i => i.id).join(',');
        const newIds = newOrder.map(i => i.id).join(',');

        if (currentIds === newIds) return;

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

    const handleUpdateMetadata = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Updating metadata...');
        try {
            const { error } = await supabase
                .from('artworks')
                .update({
                    title: editingItem.title,
                    medium: editingItem.medium,
                    year: editingItem.year,
                    description: editingItem.description
                })
                .eq('id', editingItem.id);

            if (error) throw error;

            toast.success('Metadata updated', { id: toastId });
            setEditingItem(null);
            fetchContent();
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update metadata', { id: toastId });
        }
    };

    const handleUploadComplete = (uploadedIds) => {
        setShowUpload(false);
        fetchContent();

        // If exactly one image was uploaded, open edit modal for it
        if (uploadedIds.length === 1) {
            const newId = uploadedIds[0];
            setTimeout(async () => {
                const { data } = await supabase.from('artworks').select('*').eq('id', newId).single();
                if (data) {
                    setEditingItem({ ...data, type: 'file' });
                }
            }, 500);
        }
    };

    return (

        <div className="space-y-10">
            {/* Header */}
            <div className="sticky top-0 bg-[#0A0A0A]/95 backdrop-blur-xl z-40 pb-6 pt-2 -mt-2 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-2xl font-serif tracking-tight">
                    <button
                        onClick={goUp}
                        disabled={view === 'root'}
                        className={`hover:bg-white/5 px-2 py-1 rounded-lg transition-all ${view === 'root' ? 'text-white cursor-default' : 'text-gray-600 hover:text-white'}`}
                    >
                        Portfolio
                    </button>
                    {view === 'folder' && (
                        <>
                            <ChevronRight size={20} className="text-gray-800" />
                            <span className="font-bold text-white">{currentCollection?.title}</span>
                        </>
                    )}
                </div>

                <div className="flex gap-3">
                    {hasUnsavedChanges ? (
                        <>
                            <button onClick={cancelReorder} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Cancel</button>
                            <button onClick={saveOrder} className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 shadow-xl shadow-white/5 transition-all">Save Order</button>
                        </>
                    ) : (
                        <>
                            {view === 'root' && (
                                <button onClick={() => setShowCreateFolder(true)} className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                                    <Plus size={16} /> <span className="hidden sm:inline">New Collection</span>
                                </button>
                            )}
                            <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 shadow-xl shadow-white/5 transition-all">
                                <UploadCloud size={16} /> <span className="hidden sm:inline">Upload Images</span>
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
                    <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-3">
                        {items.map(item => (
                            <Reorder.Item key={`${item.type}-${item.id}`} value={item}>
                                <div className={`
                                group relative flex items-center gap-5 p-4 rounded-2xl border transition-all duration-300
                                ${item.type === 'folder' ? 'bg-[#151515] border-white/5 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'}
                            `}>
                                    <div className="cursor-grab active:cursor-grabbing text-gray-700 hover:text-white p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"><GripVertical size={20} /></div>
                                    <div
                                        onClick={() => item.type === 'folder' && enterFolder(item)}
                                        className={`w-14 h-14 flex items-center justify-center rounded-xl overflow-hidden cursor-pointer shadow-lg transition-transform group-hover:scale-105 ${item.type === 'folder' ? 'bg-white/5 text-white' : 'bg-[#222]'}`}
                                    >
                                        {item.type === 'folder' ? <Folder size={24} className="opacity-40" /> : <img src={item.image_url} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 cursor-pointer" onClick={() => item.type === 'folder' && enterFolder(item)}>
                                        <h3 className="font-medium text-sm tracking-tight text-white mb-0.5">{item.title}</h3>
                                        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">{item.type === 'folder' ? 'Collection' : item.medium || 'Artwork'}</p>
                                    </div>
                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        {item.type === 'file' && (
                                            <button
                                                onClick={() => setEditingItem(item)}
                                                className="p-2.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                                title="Edit Metadata"
                                            >
                                                <ImageIcon size={18} />
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(item)} className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"><Trash2 size={18} /></button>
                                    </div>

                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                )
            }

            {/* Models */}
            {
                showCreateFolder && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                        <div className="bg-[#151515] p-10 rounded-3xl shadow-2xl border border-white/5 w-full max-w-md animate-in zoom-in-95 duration-200">
                            <h3 className="font-serif text-2xl mb-6 text-white tracking-tight">New Collection</h3>
                            <form onSubmit={handleCreateFolder}>
                                <input
                                    autoFocus
                                    placeholder="Folder Name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-8 outline-none focus:border-white text-white placeholder-gray-600 transition-all"
                                    value={newFolderName}
                                    onChange={e => setNewFolderName(e.target.value)}
                                />
                                <div className="flex justify-end gap-4">
                                    <button type="button" onClick={() => setShowCreateFolder(false)} className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Cancel</button>
                                    <button disabled={!newFolderName} className="bg-white text-black px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all disabled:opacity-50">Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                showUpload && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-left">
                        <UploadModal
                            onClose={() => setShowUpload(false)}
                            collectionId={currentCollection?.id}
                            onSuccess={handleUploadComplete}
                        />

                    </div>
                )
            }

            {/* Edit Metadata Modal - Mobile Responsive Overhaul */}
            {editingItem && (
                <div className="fixed inset-0 bg-black z-[100] md:bg-black/60 md:backdrop-blur-md flex items-center justify-center p-0 md:p-6 overflow-y-auto">
                    <div className="bg-[#111111] md:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 min-h-screen md:min-h-0 flex flex-col">

                        {/* Mobile Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 md:hidden">
                            <h3 className="text-xl font-serif">Edit Metadata</h3>
                            <button onClick={() => setEditingItem(null)} className="p-2 text-gray-500"><X size={24} /></button>
                        </div>

                        <div className="flex flex-col md:flex-row flex-1">
                            {/* Image Preview Area */}
                            <div className="w-full md:w-[45%] bg-black/40 p-10 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
                                <img src={editingItem.image_url} className="w-full h-auto max-h-[40vh] md:max-h-full object-contain rounded-lg shadow-2xl shadow-black ring-1 ring-white/10" alt="Preview" />
                            </div>

                            {/* Form Area */}
                            <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                                <h3 className="text-3xl font-serif mb-8 hidden md:block tracking-tight text-white">Artwork Details</h3>
                                <form onSubmit={handleUpdateMetadata} className="space-y-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em] mb-3">Master Title</label>
                                            <input
                                                autoFocus
                                                value={editingItem.title}
                                                onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-white text-white transition-all text-lg"
                                                placeholder="Enter title"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em] mb-3">Medium</label>
                                                <input
                                                    value={editingItem.medium}
                                                    onChange={e => setEditingItem({ ...editingItem, medium: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-white text-white transition-all"
                                                    placeholder="e.g. Oil on Canvas"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em] mb-3">Created Year</label>
                                                <input
                                                    value={editingItem.year}
                                                    onChange={e => setEditingItem({ ...editingItem, year: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-white text-white transition-all"
                                                    placeholder="YYYY"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em] mb-3">Description / Provenance</label>
                                            <textarea
                                                value={editingItem.description || ''}
                                                onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-white text-white transition-all resize-none h-40 text-sm leading-relaxed"
                                                placeholder="A brief history of the piece..."
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setEditingItem(null)}
                                            className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-white text-black px-12 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl shadow-white/5 active:scale-[0.98]"
                                        >
                                            Apply Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
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
            onSuccess(newIds);
            onClose();

        } catch (error) {
            console.error(error);
            toast.error('Upload failed', { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-[100] md:bg-black/60 md:backdrop-blur-md flex items-center justify-center p-0 md:p-6 overflow-hidden">
            <div className="bg-[#111111] md:rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col h-screen md:h-[80vh] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-[#151515]">
                    <div>
                        <h2 className="text-2xl font-serif text-white tracking-tight">Image Studio</h2>
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 mt-1">Batch Uploading</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Controls Side */}
                    <div className="w-full md:w-80 p-8 border-b md:border-b-0 md:border-r border-white/5 bg-[#121212] space-y-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-2">Global Year</label>
                                <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-white outline-none transition-all" value={year} onChange={e => setYear(e.target.value)} placeholder="Year" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-2">Global Medium</label>
                                <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-white outline-none transition-all" value={medium} onChange={e => setMedium(e.target.value)} placeholder="Medium" />
                            </div>
                        </div>

                        <label className="block border-2 border-dashed border-white/10 h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-white/20 rounded-2xl transition-all group">
                            <input type="file" multiple hidden onChange={handleFileSelect} />
                            <UploadCloud size={32} className="text-gray-600 group-hover:text-white transition-colors mb-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white">Add Files</span>
                        </label>
                    </div>

                    {/* Preview Side */}
                    <div className="flex-1 p-8 overflow-y-auto bg-[#0A0A0A] custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {stagedFiles.map((f, i) => (
                                <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-white/5 bg-[#151515]">
                                    <img src={f.preview} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                        <p className="text-[10px] font-mono text-white truncate">{f.title}</p>
                                    </div>
                                </div>
                            ))}
                            {stagedFiles.length === 0 && (
                                <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-600">
                                    <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center mb-4">
                                        <ImageIcon size={32} strokeWidth={1} />
                                    </div>
                                    <p className="text-xs font-mono uppercase tracking-widest">Awaiting assets</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 md:p-8 border-t border-white/5 flex justify-end gap-6 bg-[#151515]">
                    <button onClick={onClose} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Discard</button>
                    <button
                        onClick={handleBatchUpload}
                        disabled={uploading || stagedFiles.length === 0}
                        className="bg-white text-black px-10 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl shadow-white/5 disabled:opacity-20"
                    >
                        {uploading ? 'Processing...' : `Upload ${stagedFiles.length} Assets`}
                    </button>
                </div>
            </div>
        </div>
    )
}

