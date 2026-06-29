import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryApi } from '../../services/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import { Upload, Trash2, GripVertical, Save, Image } from 'lucide-react';

export default function Gallery() {
  const qc    = useQueryClient();
  const input = useRef();
  const [localItems, setLocalItems] = useState([]);
  const [orderChanged, setOrderChanged] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ['gallery-admin'],
    queryFn: () => galleryApi.getAll().then(r => r.data),
  });

  useEffect(() => { setLocalItems(items); setOrderChanged(false); }, [items]);

  const doUpload = files => {
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('image', f));
    upload.mutate(fd);
  };

  const upload = useMutation({
    mutationFn: fd => galleryApi.create(fd),
    onSuccess: () => { toast.success('Image added'); qc.invalidateQueries(['gallery-admin']); },
    onError:   () => toast.error('Upload failed'),
  });
  const remove = useMutation({
    mutationFn: galleryApi.remove,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['gallery-admin']); },
    onError:   () => toast.error('Delete failed'),
  });
  const reorder = useMutation({
    mutationFn: ids => galleryApi.reorder(ids),
    onSuccess: () => { toast.success('Order saved'); setOrderChanged(false); qc.invalidateQueries(['gallery-admin']); },
    onError:   () => toast.error('Failed to save order'),
  });

  const onDragEnd = result => {
    if (!result.destination) return;
    const arr = Array.from(localItems);
    const [moved] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, moved);
    setLocalItems(arr);
    setOrderChanged(true);
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:26, color:'#e8c76e', marginBottom:2 }}>Gallery</h1>
          <p style={{ fontSize:12, color:'rgba(201,168,76,.45)' }}>Drag to reorder photos · Hover to delete</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {orderChanged && (
            <button onClick={() => reorder.mutate(localItems.map(i => i.id))} disabled={reorder.isPending}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'linear-gradient(135deg,#c9a84c,#9e7a2e)', border:'none', borderRadius:7, color:'#060f1a', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer' }}>
              <Save size={13} /> {reorder.isPending ? 'Saving…' : 'Save Order'}
            </button>
          )}
          <button onClick={() => input.current.click()}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 18px', background:'rgba(201,168,76,.1)', border:'1px solid rgba(201,168,76,.3)', borderRadius:7, color:'#e8c76e', fontSize:12, fontWeight:600, cursor:'pointer', letterSpacing:'0.06em' }}>
            <Upload size={14} /> Upload Photos
          </button>
          <input ref={input} type="file" multiple accept="image/*" style={{ display:'none' }}
            onChange={e => { doUpload(e.target.files); e.target.value = ''; }} />
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); doUpload(e.dataTransfer.files); }}
        onClick={() => localItems.length === 0 && input.current.click()}
        style={{
          border: `2px dashed ${dragOver ? '#c9a84c' : 'rgba(201,168,76,.2)'}`,
          borderRadius:12, padding:'20px 16px', marginBottom:20,
          background: dragOver ? 'rgba(201,168,76,.06)' : 'transparent',
          transition:'all .2s', cursor: localItems.length === 0 ? 'pointer' : 'default',
          textAlign:'center', color:'rgba(201,168,76,.35)', fontSize:12,
          display: localItems.length === 0 ? 'flex' : 'none',
          flexDirection:'column', alignItems:'center', gap:8, minHeight:140, justifyContent:'center',
        }}
      >
        <Image size={32} color="rgba(201,168,76,.25)" />
        <p>Drop images here or <span style={{ color:'#c9a84c', textDecoration:'underline' }}>browse files</span></p>
        <p style={{ fontSize:11, opacity:.6 }}>JPG, PNG, WEBP supported</p>
      </div>

      {/* DnD Grid */}
      {localItems.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="gallery">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}
                style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
                {localItems.map((img, index) => (
                  <Draggable key={String(img.id)} draggableId={String(img.id)} index={index}>
                    {(prov, snap) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        style={{
                          position:'relative', aspectRatio:'4/3', borderRadius:10, overflow:'hidden',
                          border: snap.isDragging ? '2px solid #c9a84c' : '1px solid rgba(201,168,76,.15)',
                          boxShadow: snap.isDragging ? '0 10px 30px rgba(201,168,76,.2)' : 'none',
                          ...prov.draggableProps.style,
                        }}
                      >
                        <img src={img.url} alt={img.caption || ''} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />

                        {/* Drag handle */}
                        <div {...prov.dragHandleProps} style={{
                          position:'absolute', top:6, left:6, background:'rgba(6,15,26,.75)',
                          borderRadius:5, padding:'3px 5px', cursor:'grab', color:'rgba(201,168,76,.7)',
                          display:'flex', alignItems:'center',
                        }}>
                          <GripVertical size={13} />
                        </div>

                        {/* Delete hover */}
                        <div style={{
                          position:'absolute', inset:0, background:'rgba(6,15,26,.65)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          opacity:0, transition:'opacity .2s',
                        }}
                          onMouseOver={e => e.currentTarget.style.opacity='1'}
                          onMouseOut={e => e.currentTarget.style.opacity='0'}
                        >
                          <button onClick={() => remove.mutate(img.id)}
                            style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', background:'rgba(239,68,68,.85)', border:'none', borderRadius:7, color:'#fff', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>

                        {img.caption && (
                          <p style={{ position:'absolute', bottom:0, left:0, right:0, padding:'4px 8px', fontSize:10, color:'rgba(255,255,255,.7)', background:'rgba(6,15,26,.7)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {img.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
