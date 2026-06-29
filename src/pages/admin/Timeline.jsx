import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timelineApi } from '../../services/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import { GripVertical, Plus, Pencil, Trash2, Check, X, Save } from 'lucide-react';

const ICONS = ['🎓','👤','🏆','🎖️','📸','👥','🎶','📜','🎉','🌟','🎤','🎊'];
const empty = { time:'', title:'', description:'', icon:'🎓' };

const card  = { background:'#0a1628', border:'1px solid rgba(201,168,76,.15)', borderRadius:10 };
const inp   = { width:'100%', background:'#060f1a', border:'1px solid rgba(201,168,76,.2)', borderRadius:7, padding:'8px 12px', color:'#e8c76e', fontSize:13, outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box' };
const lbl   = { display:'block', fontSize:10, color:'rgba(201,168,76,.45)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 };

export default function Timeline() {
  const qc = useQueryClient();
  const [form, setForm]       = useState(empty);
  const [editing, setEditing] = useState(null);
  const [localItems, setLocalItems] = useState([]);
  const [orderChanged, setOrderChanged] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ['timeline-admin'],
    queryFn: () => timelineApi.getAll().then(r => r.data),
  });

  useEffect(() => { setLocalItems(items); setOrderChanged(false); }, [items]);

  const create = useMutation({
    mutationFn: timelineApi.create,
    onSuccess: () => { toast.success('Item added'); setForm(empty); qc.invalidateQueries(['timeline-admin']); },
    onError: () => toast.error('Failed to add'),
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => timelineApi.update(id, data),
    onSuccess: () => { toast.success('Updated'); setEditing(null); qc.invalidateQueries(['timeline-admin']); },
    onError: () => toast.error('Update failed'),
  });
  const remove = useMutation({
    mutationFn: timelineApi.remove,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['timeline-admin']); },
  });
  const reorder = useMutation({
    mutationFn: (ids) => timelineApi.reorder(ids),
    onSuccess: () => { toast.success('Order saved'); setOrderChanged(false); qc.invalidateQueries(['timeline-admin']); },
    onError: () => toast.error('Failed to save order'),
  });

  const onDragEnd = result => {
    if (!result.destination) return;
    const arr = Array.from(localItems);
    const [moved] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, moved);
    setLocalItems(arr);
    setOrderChanged(true);
  };

  const submit = e => {
    e.preventDefault();
    if (editing) update.mutate({ id: editing, data: form });
    else create.mutate(form);
  };

  const startEdit = item => {
    setForm({ time: item.time, title: item.title, description: item.description || '', icon: item.icon });
    setEditing(item.id);
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:26, color:'#e8c76e', marginBottom:2 }}>Program Timeline</h1>
          <p style={{ fontSize:12, color:'rgba(201,168,76,.45)' }}>Drag to reorder · Click edit to modify an item</p>
        </div>
        {orderChanged && (
          <button onClick={() => reorder.mutate(localItems.map(i => i.id))} disabled={reorder.isPending}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', background:'linear-gradient(135deg,#c9a84c,#9e7a2e)', border:'none', borderRadius:7, color:'#060f1a', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer' }}>
            <Save size={13} /> {reorder.isPending ? 'Saving…' : 'Save Order'}
          </button>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20 }}>

        {/* DnD List */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="timeline">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps} style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {localItems.map((item, index) => (
                  <Draggable key={String(item.id)} draggableId={String(item.id)} index={index}>
                    {(prov, snap) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        style={{
                          ...card, padding:'12px 14px',
                          display:'flex', alignItems:'center', gap:12,
                          boxShadow: snap.isDragging ? '0 8px 32px rgba(201,168,76,.25)' : 'none',
                          background: snap.isDragging ? '#0f1e35' : '#0a1628',
                          ...prov.draggableProps.style,
                        }}
                      >
                        <div {...prov.dragHandleProps} style={{ color:'rgba(201,168,76,.3)', cursor:'grab', display:'flex', alignItems:'center', padding:'0 2px' }}>
                          <GripVertical size={16} />
                        </div>
                        <span style={{ fontSize:22, flexShrink:0 }}>{item.icon}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:10, color:'rgba(201,168,76,.5)', marginBottom:2 }}>{item.time}</p>
                          <p style={{ fontSize:13, color:'#e8c76e', fontWeight:600 }}>{item.title}</p>
                          {item.description && <p style={{ fontSize:11, color:'rgba(201,168,76,.45)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.description}</p>}
                        </div>
                        <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                          <button onClick={() => startEdit(item)} style={{ background:'rgba(201,168,76,.1)', border:'1px solid rgba(201,168,76,.2)', borderRadius:6, padding:'5px 8px', color:'#c9a84c', cursor:'pointer', display:'flex', alignItems:'center' }}>
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => remove.mutate(item.id)} style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:6, padding:'5px 8px', color:'#f87171', cursor:'pointer', display:'flex', alignItems:'center' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Form */}
        <div style={{ ...card, padding:'20px 18px', alignSelf:'start' }}>
          <h2 style={{ fontSize:13, fontWeight:700, color:'rgba(201,168,76,.7)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:16, display:'flex', alignItems:'center', gap:6 }}>
            {editing ? <><Pencil size={13} /> Edit Item</> : <><Plus size={13} /> Add Item</>}
          </h2>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label style={lbl}>Time</label>
              <input placeholder="09:00 AM" value={form.time} required onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Title</label>
              <input placeholder="Opening Ceremony" value={form.title} required onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Description (optional)</label>
              <input placeholder="Brief description…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Icon</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:6 }}>
                {ICONS.map(ic => (
                  <button type="button" key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                    style={{ fontSize:18, padding:'4px 6px', borderRadius:6, cursor:'pointer', border: form.icon === ic ? '2px solid #c9a84c' : '2px solid transparent', background: form.icon === ic ? 'rgba(201,168,76,.15)' : 'transparent' }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:4 }}>
              <button type="submit" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px', background:'linear-gradient(135deg,#c9a84c,#9e7a2e)', border:'none', borderRadius:7, color:'#060f1a', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer' }}>
                <Check size={13} /> {editing ? 'Update' : 'Add'}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm(empty); }}
                  style={{ padding:'9px 12px', background:'rgba(201,168,76,.08)', border:'1px solid rgba(201,168,76,.2)', borderRadius:7, color:'rgba(201,168,76,.6)', cursor:'pointer', display:'flex', alignItems:'center' }}>
                  <X size={13} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
