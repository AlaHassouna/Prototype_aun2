import React from 'react';
import { useNavigate } from 'react-router-dom';

const SCHOOLS = [
  { label: 'IIT Tech',     sub: 'Technology',            path: '/iit-tech/First-Last' },
  { label: 'IIT GI',       sub: 'Computer Engineering',  path: '/iit-genie-info/First-Last' },
  { label: 'IIT LI-Arch',  sub: 'Licensing & Arch.',     path: '/iit-li-arch/First-Last' },
  { label: 'ISB',          sub: 'Institute of Sciences', path: '/isb/First-Last' },
];

export default function ChoosePage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --gold: #c9a84c; --goldl: #e8c76e; --dark: #06101a; }
        html, body { width: 100%; height: 100%; background: var(--dark); font-family: 'Inter', sans-serif; }

        .cp-root {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at 50% 38%, rgba(201,168,76,.08) 0%, transparent 62%), #06101a;
          padding: 2.5rem 1.5rem;
          text-align: center;
        }

        .cp-eyebrow {
          font-size: .52rem;
          font-weight: 700;
          letter-spacing: .5em;
          text-transform: uppercase;
          color: var(--gold);
          opacity: .75;
          margin-bottom: 1.1rem;
        }

        .cp-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.9rem, 7.5vw, 3rem);
          color: #fff;
          line-height: 1.18;
          text-shadow: 0 2px 20px rgba(0,0,0,.7);
        }
        .cp-title span { color: var(--gold); }

        .cp-sep {
          width: 52px;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          margin: 1rem auto 1.4rem;
        }

        .cp-msg {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(.98rem, 3.8vw, 1.15rem);
          color: rgba(255,255,255,.5);
          font-style: italic;
          max-width: 300px;
          line-height: 1.7;
          margin-bottom: 2.5rem;
        }

        /* ── 2 × 2 grid ── */
        .cp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: .85rem;
          width: 100%;
          max-width: 400px;
        }

        .cp-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: .32rem;
          padding: 1.2rem .8rem;
          border-radius: 6px;
          border: 1.5px solid rgba(201,168,76,.38);
          background: rgba(6,16,26,.55);
          backdrop-filter: blur(12px);
          color: var(--goldl);
          cursor: pointer;
          transition: transform .22s, box-shadow .22s, background .22s, border-color .22s;
          box-shadow: 0 3px 16px rgba(201,168,76,.1);
        }
        .cp-btn:hover {
          transform: translateY(-3px) scale(1.03);
          background: rgba(201,168,76,.12);
          border-color: var(--gold);
          box-shadow: 0 8px 28px rgba(201,168,76,.26);
        }
        .cp-btn:active { transform: scale(.97); }

        .cp-btn-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1rem, 4vw, 1.25rem);
          font-weight: 700;
          letter-spacing: .08em;
          white-space: nowrap;
        }
        .cp-btn-sub {
          font-family: 'Inter', sans-serif;
          font-size: .42rem;
          font-weight: 700;
          letter-spacing: .28em;
          text-transform: uppercase;
          color: rgba(201,168,76,.5);
          white-space: nowrap;
        }

        .cp-note {
          margin-top: 2.6rem;
          font-size: .56rem;
          font-weight: 600;
          letter-spacing: .13em;
          color: rgba(255,255,255,.2);
          text-transform: uppercase;
          line-height: 2;
        }
        .cp-note code {
          font-family: 'Courier New', monospace;
          font-size: .56rem;
          color: rgba(201,168,76,.4);
          background: rgba(201,168,76,.06);
          padding: .08rem .4rem;
          border-radius: 3px;
        }

        .corner {
          position: fixed;
          width: 14px; height: 14px;
          border-color: rgba(201,168,76,.26);
          border-style: solid;
        }
        .c-tl { top: 1.2rem; left: 1.2rem; border-width: 1.5px 0 0 1.5px; }
        .c-tr { top: 1.2rem; right: 1.2rem; border-width: 1.5px 1.5px 0 0; }
        .c-bl { bottom: 1.2rem; left: 1.2rem; border-width: 0 0 1.5px 1.5px; }
        .c-br { bottom: 1.2rem; right: 1.2rem; border-width: 0 1.5px 1.5px 0; }
      `}</style>

      <div className="corner c-tl" />
      <div className="corner c-tr" />
      <div className="corner c-bl" />
      <div className="corner c-br" />

      <div className="cp-root">
        <div className="cp-eyebrow">Graduation Ceremony · Class of 2026</div>
        <h1 className="cp-title">
          Welcome to your<br /><span>Graduation Invitation</span>
        </h1>
        <div className="cp-sep" />
        <p className="cp-msg">
          Select your school to access your personalized invitation.
        </p>

        <div className="cp-grid">
          {SCHOOLS.map(s => (
            <button key={s.path} className="cp-btn" onClick={() => navigate(s.path)}>
              <span className="cp-btn-name">{s.label}</span>
              <span className="cp-btn-sub">{s.sub}</span>
            </button>
          ))}
        </div>

        <div className="cp-note">
          {'Personalized link:'}<br />
          {['/iit-tech/[name]', '/iit-genie-info/[name]', '/iit-li-arch/[name]', '/isb/[name]'].map((r, i, a) => (
            <React.Fragment key={r}><code>{r}</code>{i < a.length - 1 ? ' · ' : ''}</React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
