import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import {
  LayoutDashboard, Type, Image, Calendar,
  Mail, FolderOpen, Users, Settings,
  LogOut, ChevronLeft, ChevronRight, Eye, GraduationCap,
} from 'lucide-react';

const nav = [
  { to: 'dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
  { to: 'sections',  Icon: Type,            label: 'Page Sections' },
  { to: 'gallery',   Icon: Image,           label: 'Gallery' },
  { to: 'timeline',  Icon: Calendar,        label: 'Timeline' },
  { to: 'rsvp',      Icon: Mail,            label: 'RSVP' },
  { to: 'media',     Icon: FolderOpen,      label: 'Media' },
  { to: 'users',     Icon: Users,           label: 'Users' },
  { to: 'settings',  Icon: Settings,        label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  return (
    <div style={{ display:'flex', height:'100vh', background:'#060f1a', color:'#c9a84c', overflow:'hidden', fontFamily:'Inter,sans-serif' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: open ? 220 : 56,
        transition: 'width .25s ease',
        background: '#0a1628',
        borderRight: '1px solid rgba(201,168,76,.1)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(201,168,76,.1)', display:'flex', alignItems:'center', justifyContent:'space-between', minHeight:60 }}>
          {open && (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <GraduationCap size={18} color="#c9a84c" />
              <div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:13, color:'#e8c76e', fontWeight:600, lineHeight:1.2 }}>Graduation</div>
                <div style={{ fontSize:10, color:'rgba(201,168,76,.4)', letterSpacing:'0.06em' }}>Admin Panel</div>
              </div>
            </div>
          )}
          <button onClick={() => setOpen(s => !s)} style={{ marginLeft:'auto', color:'rgba(201,168,76,.4)', background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:4, display:'flex', alignItems:'center' }}>
            {open ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
          {nav.map(({ to, Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:10,
              padding: open ? '9px 16px' : '9px 0',
              justifyContent: open ? 'flex-start' : 'center',
              fontSize:13, textDecoration:'none', transition:'background .15s,color .15s',
              background: isActive ? 'rgba(201,168,76,.1)' : 'transparent',
              color: isActive ? '#e8c76e' : 'rgba(201,168,76,.5)',
              borderRight: isActive ? '2px solid #c9a84c' : '2px solid transparent',
            })}>
              <Icon size={16} style={{ flexShrink:0 }} />
              {open && <span style={{ whiteSpace:'nowrap' }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding:'8px', borderTop:'1px solid rgba(201,168,76,.1)', display:'flex', flexDirection:'column', gap:2 }}>
          <a href="/" target="_blank" style={{
            display:'flex', alignItems:'center', gap:8,
            padding: open ? '7px 10px' : '7px 0', justifyContent: open ? 'flex-start' : 'center',
            fontSize:12, color:'rgba(201,168,76,.4)', textDecoration:'none', borderRadius:6,
            transition:'color .15s',
          }}
            onMouseOver={e => e.currentTarget.style.color='rgba(201,168,76,.8)'}
            onMouseOut={e => e.currentTarget.style.color='rgba(201,168,76,.4)'}
          >
            <Eye size={13} />{open && 'View Site'}
          </a>
          <button onClick={() => { logout(); navigate('/admin/login'); }} style={{
            display:'flex', alignItems:'center', gap:8,
            padding: open ? '7px 10px' : '7px 0', justifyContent: open ? 'flex-start' : 'center',
            fontSize:12, color:'rgba(201,168,76,.4)', background:'none', border:'none', cursor:'pointer',
            borderRadius:6, transition:'color .15s', width:'100%',
          }}
            onMouseOver={e => e.currentTarget.style.color='#f87171'}
            onMouseOut={e => e.currentTarget.style.color='rgba(201,168,76,.4)'}
          >
            <LogOut size={13} />{open && 'Sign Out'}
          </button>
          {open && user?.name && (
            <p style={{ fontSize:10, color:'rgba(201,168,76,.25)', padding:'2px 10px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</p>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex:1, overflowY:'auto', background:'#060f1a' }}>
        <div style={{ padding:28, maxWidth:1100, margin:'0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
