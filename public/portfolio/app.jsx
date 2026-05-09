/* global React, ReactDOM, HomeSection, AboutSection, ProjectsSection, AthleticsSection, Footer, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSelect, TweakSlider */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "whisper"
}/*EDITMODE-END*/;

// Hero options surfaced to the user — saved iterations only
const HERO_OPTIONS = [
  { value: 'whisper',   label: 'A · Whisper (full-bleed)' },
  { value: 'medallion', label: 'D · Medallion (circular)' },
];
// ─────────────────────────────────────────────
//  App shell: nav, theme, cursor, shortcuts
// ─────────────────────────────────────────────

const { useEffect, useRef, useState, useCallback } = React;

const SECTIONS = [
  { id: 'home',      label: 'Home',      num: '01' },
  { id: 'about',     label: 'About',     num: '02' },
  { id: 'projects',  label: 'Projects',  num: '03' },
  { id: 'athletics', label: 'Athletics', num: '04' },
];

// theme hook with no-flash + radial reveal -------------------
const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('mv-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light'; // default light regardless of system preference
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mv-theme', theme);
  }, [theme]);

  return [theme, setTheme];
};

// nav -------------------------------------------------------
const Nav = ({ active, onJump, theme, onToggleTheme, condensed }) => {
  const toggleRef = useRef(null);

  const handleToggle = (e) => {
    const r = toggleRef.current?.getBoundingClientRect();
    if (r) {
      const rx = ((r.left + r.width/2) / window.innerWidth) * 100;
      const ry = ((r.top  + r.height/2) / window.innerHeight) * 100;
      const reveal = document.getElementById('theme-reveal');
      if (reveal) {
        reveal.style.setProperty('--rx', rx + '%');
        reveal.style.setProperty('--ry', ry + '%');
        reveal.classList.add('active');
        setTimeout(() => {
          onToggleTheme();
          setTimeout(() => reveal.classList.remove('active'), 50);
        }, 360);
      } else {
        onToggleTheme();
      }
    } else {
      onToggleTheme();
    }
  };

  return (
    <nav className={`nav-shell ${condensed ? 'nav-condensed' : ''}`}>
      <div className="nav-inner">
        <span className="nav-mark">
          <span className="dot"></span>
          QW
        </span>
        {SECTIONS.map(s => (
          <a key={s.id} href={`#${s.id}`}
             className={`nav-link interactive ${active === s.id ? 'active' : ''}`}
             onClick={(e) => { e.preventDefault(); onJump(s.id); }}>
            <span className="num">{s.num}</span>{s.label}
          </a>
        ))}
        <button
          ref={toggleRef}
          onClick={handleToggle}
          className="nav-toggle interactive"
          aria-label="Toggle theme"
          title="Toggle theme (T)"
          data-cursor-label="Theme">
          {theme === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
};

// custom cursor --------------------------------------------
const CustomCursor = () => {
  const ref = useRef(null);
  const labelRef = useRef('');

  useEffect(() => {
    const cur = ref.current;
    if (!cur) return;
    let x = -100, y = -100, tx = -100, ty = -100;
    let raf;
    let lastEl = null;

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;

      // detect interactive
      const el = e.target.closest('a, button, .interactive, [role=button], input, textarea');
      if (el !== lastEl) {
        cur.classList.remove('hover', 'label', 'dot');
        const lbl = el?.getAttribute('data-cursor-label');
        if (lbl) {
          cur.classList.add('label');
          cur.textContent = lbl;
        } else if (el) {
          cur.classList.add('hover');
          cur.textContent = '';
        } else {
          cur.classList.add('dot');
          cur.textContent = '';
        }
        lastEl = el;
      }
    };

    const tick = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      cur.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    cur.classList.add('dot');
    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="custom-cursor"></div>;
};

// shortcuts overlay ---------------------------------------
const Shortcuts = ({ open, onClose }) => {
  if (!open) return null;
  const items = [
    { keys: ['?'], desc: 'Toggle this menu' },
    { keys: ['T'], desc: 'Toggle theme' },
    { keys: ['1'], desc: 'Jump to Home' },
    { keys: ['2'], desc: 'Jump to About' },
    { keys: ['3'], desc: 'Jump to Projects' },
    { keys: ['4'], desc: 'Jump to Athletics' },
    { keys: ['G', 'G'], desc: 'Top of page' },
    { keys: ['Esc'], desc: 'Close menus' },
  ];
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex: 300,
      background:'color-mix(in oklab, var(--fg) 30%, transparent)',
      backdropFilter:'blur(6px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      animation: 'plFade 240ms ease forwards', opacity: 0,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 'min(540px, calc(100vw - 40px))',
        background:'var(--bg)', border:'1px solid var(--line)', borderRadius: 18,
        padding: 32, boxShadow:'0 30px 80px -20px color-mix(in oklab, var(--fg) 30%, transparent)',
      }}>
        <div className="fl-row" style={{ justifyContent:'space-between', marginBottom: 24 }}>
          <span className="eyebrow">§ Keyboard shortcuts</span>
          <button onClick={onClose} className="interactive" style={{
            background:'transparent', border:'1px solid var(--line)', borderRadius: 999,
            width: 28, height: 28, color:'var(--fg)', display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          }}>×</button>
        </div>
        <ul style={{ listStyle:'none', margin: 0, padding: 0 }}>
          {items.map((it, i) => (
            <li key={i} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'14px 0', borderBottom:'1px solid var(--line)',
            }}>
              <span className="font-serif" style={{ fontSize: 15, color: 'var(--fg-2)' }}>{it.desc}</span>
              <span className="fl-row" style={{ gap: 6 }}>
                {it.keys.map((k, j) => <span key={j} className="kbd">{k}</span>)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// page loader ------------------------------------------------
const PageLoader = ({ gone }) => {
  return (
    <div className={`page-loader ${gone ? 'gone' : ''}`}>
      <div className="pl-mark">
        <span>Quinn Woodhead</span>
        <span className="ln"></span>
        <span className="font-mono" style={{ fontSize: 12, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>v 4.2</span>
      </div>
    </div>
  );
};

// main app -------------------------------------------------
const App = () => {
  const [theme, setTheme] = useTheme();
  const [active, setActive] = useState('home');
  const [condensed, setCondensed] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const lastG = useRef(0);
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), [setTheme]);

  const jumpTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - (id === 'home' ? 0 : 24), behavior: 'smooth' });
    }
  }, []);

  // scroll observer for active section + nav condensation -------
  useEffect(() => {
    const onScroll = () => {
      setCondensed(window.scrollY > 80);
      let cur = 'home';
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= window.innerHeight * 0.4) cur = s.id;
        }
      }
      setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // keyboard shortcuts -----------------------------------------
  useEffect(() => {
    const onKey = (e) => {
      const target = e.target;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;

      if (e.key === '?') { e.preventDefault(); setShortcuts(o => !o); }
      else if (e.key === 'Escape') { setShortcuts(false); }
      else if (e.key === 't' || e.key === 'T') { toggleTheme(); }
      else if (e.key === '1') jumpTo('home');
      else if (e.key === '2') jumpTo('about');
      else if (e.key === '3') jumpTo('projects');
      else if (e.key === '4') jumpTo('athletics');
      else if (e.key === 'g') {
        const now = Date.now();
        if (now - lastG.current < 500) jumpTo('home');
        lastG.current = now;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jumpTo, toggleTheme]);

  // hide loader -----------------------------------------------
  useEffect(() => {
    const t = setTimeout(() => setLoaderGone(true), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <PageLoader gone={loaderGone} />
      <div id="theme-reveal" className="theme-reveal"></div>
      {/* <CustomCursor /> — using native cursor */}
      <Nav
        active={active}
        onJump={jumpTo}
        theme={theme}
        onToggleTheme={toggleTheme}
        condensed={condensed}
      />
      <main>
        <HomeSection theme={theme} variant={tw.heroVariant} />
        <AboutSection />
        <ProjectsSection />
        <AthleticsSection theme={theme} />
        <Footer />
      </main>
      <Shortcuts open={shortcuts} onClose={() => setShortcuts(false)} />
      <aside className="side-rail" aria-label="External links">
        <a href="https://www.linkedin.com/in/quinn-woodhead-b6558817a/" target="_blank" rel="noopener noreferrer" className="interactive" data-cursor-label="LinkedIn">
          <span className="arrow">↗ </span>LinkedIn
        </a>
        <a href="[RESUME PDF URL]" download target="_blank" rel="noopener noreferrer" className="interactive" data-cursor-label="Résumé PDF">
          <span className="arrow">↓ </span>Résumé
        </a>
        <a href="Coach Portal.html" target="_blank" rel="noopener noreferrer" className="interactive" data-cursor-label="For my swimmers">
          <span className="arrow">→ </span>Coach&nbsp;Portal
        </a>
      </aside>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Hero treatment" />
        <TweakRadio
          label="Hero variant"
          value={tw.heroVariant}
          options={HERO_OPTIONS}
          onChange={(v) => setTweak('heroVariant', v)}
        />
      </TweaksPanel>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
