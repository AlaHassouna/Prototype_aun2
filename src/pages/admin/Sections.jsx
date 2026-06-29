import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectionsApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Save, Eye, EyeOff, ChevronRight, Type, Info, Heart, Timer, Calendar, Image, Mail, Quote, AlignLeft } from 'lucide-react';

const SECTIONS = [
  { key:'hero',       label:'Hero Banner',         Icon:Type,      desc:'Main heading & subtitle' },
  { key:'event_info', label:'Event Information',   Icon:Info,      desc:'Date, time & venue' },
  { key:'welcome',    label:'Welcome Message',     Icon:Heart,     desc:'Message to graduates' },
  { key:'countdown',  label:'Countdown Timer',     Icon:Timer,     desc:'Target ceremony date' },
  { key:'timeline',   label:'Program Timeline',    Icon:Calendar,  desc:'Schedule section title' },
  { key:'gallery',    label:'Gallery',             Icon:Image,     desc:'Photo gallery heading' },
  { key:'rsvp',       label:'RSVP',                Icon:Mail,      desc:'Registration section' },
  { key:'quote',      label:'Inspirational Quote', Icon:Quote,     desc:'Motivational quote' },
  { key:'footer',     label:'Footer',              Icon:AlignLeft, desc:'Footer text' },
];

const FIELD_LABELS = {
  heading:'Heading', subheading:'Subheading', body:'Body Text',
  buttonText:'Button Text', backgroundImage:'Background Image URL',
  date:'Date', time:'Time', location:'Venue Name', address:'Address', mapUrl:'Google Maps URL',
  signature:'Signature', targetDate:'Target Date & Time',
  text:'Quote Text', author:'Author',
};

const G   = { background:'#0a1628', border:'1px solid rgba(201,168,76,.18)', borderRadius:12, padding:'20px 22px' };
const inp = { width:'100%', background:'#060f1a', border:'1px solid rgba(201,168,76,.2)', borderRadius:8, padding:'9px 14px', color:'#e8c76e', fontSize:13, outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box' };

export default function Sections() {
  const qc = useQueryClient();
  const [active, setActive] = useState('hero');
  const [draft, setDraft]   = useState(null);

  const { data: section, isLoading } = useQuery({
    queryKey: ['section', active],
    queryFn:  () => sectionsApi.getOne(active).then(r => r.data),
  });

  useEffect(() => {
    if (section) setDraft({ content: { ...section.content }, visible: section.visible, title: section.title || '' });
  }, [section]);

  const save = useMutation({
    mutationFn: () => sectionsApi.update(active, { title: draft.title, content: draft.content, visible: draft.visible }),
    onSuccess: () => { toast.success('Section saved!'); qc.invalidateQueries(['section', active]); qc.invalidateQueries(['sections']); },
    onError:   () => toast.error('Save failed'),
  });

  const setField = (key, val) => setDraft(f => ({ ...f, content: { ...f.content, [key]: val } }));

  const sec     = SECTIONS.find(s => s.key === active);
  const content = draft?.content || {};
  const isDirty = draft && section && (
    JSON.stringify(draft.content) !== JSON.stringify(section.content) ||
    draft.visible !== section.visible
  );

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:26, color:'#e8c76e', marginBottom:2 }}>Page Sections</h1>
          <p style={{ fontSize:12, color:'rgba(201,168,76,.45)' }}>Click a section to edit its content</p>
        </div>
        <a href="/" target="_blank" style={{ fontSize:12, color:'rgba(201,168,76,.5)', textDecoration:'none', display:'flex', alignItems:'center', gap:5, padding:'6px 12px', border:'1px solid rgba(201,168,76,.2)', borderRadius:6 }}>
          <Eye size={13} /> Preview Site
        </a>
      </div>

      <div style={{ display:'flex', gap:20 }}>
        {/* Section List */}
        <div style={{ width:215, flexShrink:0, display:'flex', flexDirection:'column', gap:5 }}>
          {SECTIONS.map(({ key, label, Icon, desc }) => (
            <button key={key} onClick={() => setActive(key)} style={{
              display:'flex', alignItems:'center', gap:10, padding:'11px 12px',
              background: active === key ? 'rgba(201,168,76,.12)' : 'rgba(201,168,76,.03)',
              border: active === key ? '1px solid rgba(201,168,76,.35)' : '1px solid rgba(201,168,76,.08)',
              borderRadius:10, cursor:'pointer', textAlign:'left', transition:'all .15s',
              color: active === key ? '#e8c76e' : 'rgba(201,168,76,.5)',
            }}>
              <Icon size={15} style={{ flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, lineHeight:1.3 }}>{label}</div>
                <div style={{ fontSize:10, opacity:.6, lineHeight:1.3 }}>{desc}</div>
              </div>
              {active === key && <ChevronRight size={13} style={{ flexShrink:0 }} />}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div style={{ flex:1, ...G }}>
          {isLoading || !draft ? (
            <div style={{ color:'rgba(201,168,76,.3)', fontSize:13 }}>Loading…</div>
          ) : (
            <>
              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, paddingBottom:14, borderBottom:'1px solid rgba(201,168,76,.1)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                  {sec && <sec.Icon size={17} color="#c9a84c" />}
                  <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:17, color:'#e8c76e' }}>{sec?.label}</h2>
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'rgba(201,168,76,.6)', cursor:'pointer', userSelect:'none' }}>
                  {draft.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  <input type="checkbox" checked={!!draft.visible} onChange={e => setDraft(f => ({ ...f, visible: e.target.checked ? 1 : 0 }))} style={{ accentColor:'#c9a84c' }} />
                  {draft.visible ? 'Visible' : 'Hidden'}
                </label>
              </div>

              {/* Fields */}
              <div style={{ display:'flex', flexDirection:'column', gap:15 }}>
                {Object.entries(content).map(([key, val]) => {
                  if (typeof val !== 'string' && typeof val !== 'number') return null;
                  const label = FIELD_LABELS[key] || key.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase());
                  const isArea = typeof val === 'string' && (val.length > 80 || key === 'body' || key === 'text');
                  return (
                    <div key={key}>
                      <label style={{ display:'block', fontSize:11, color:'rgba(201,168,76,.45)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:5 }}>{label}</label>
                      {isArea ? (
                        <textarea rows={5} value={val} onChange={e => setField(key, e.target.value)} style={{ ...inp, resize:'vertical', lineHeight:1.6 }} />
                      ) : (
                        <input
                          type={key === 'targetDate' ? 'datetime-local' : key === 'mapUrl' ? 'url' : 'text'}
                          value={val}
                          onChange={e => setField(key, e.target.value)}
                          style={inp}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Save */}
              <button
                onClick={() => save.mutate()}
                disabled={save.isPending || !isDirty}
                style={{
                  marginTop:22, display:'flex', alignItems:'center', gap:7,
                  padding:'10px 24px',
                  background: isDirty ? 'linear-gradient(135deg,#c9a84c,#9e7a2e)' : 'rgba(201,168,76,.1)',
                  border:'none', borderRadius:8,
                  color: isDirty ? '#060f1a' : 'rgba(201,168,76,.35)',
                  fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
                  cursor: isDirty ? 'pointer' : 'not-allowed', transition:'all .2s',
                }}
              >
                <Save size={14} />
                {save.isPending ? 'Saving…' : isDirty ? 'Save Changes' : 'No Changes'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
