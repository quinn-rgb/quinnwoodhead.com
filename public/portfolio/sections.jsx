/* global React, FluidHero, AquaRibbon */
// ─────────────────────────────────────────────
//  Sections: Home overlay, About, Projects, Athletics
// ─────────────────────────────────────────────

const { useEffect, useRef, useState } = React;

// LogoOrFallback: render <img> if it loads, else fall back to a typographic mark.
// Drop a real PNG/SVG into /public/portfolio/logos/ and it will replace the fallback.
const LogoOrFallback = ({ src, alt, fallback, imgStyle }) => {
  const [errored, setErrored] = useState(false);
  if (errored) return fallback;
  return <img src={src} alt={alt} style={imgStyle} onError={() => setErrored(true)} />;
};

// reveal hook ---------------------------------
const useReveal = (opts = {}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        io.disconnect();
      }
    }, { threshold: opts.threshold ?? 0.15, rootMargin: opts.rootMargin ?? '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
};

// HOME OVERLAY -------------------------------------------------
//   variant:
//     'whisper'   — full-bleed but very faint (default)
//     'panel'     — fluid contained in right-side panel; type on solid bg
//     'horizon'   — thin band at the bottom, like a horizon
//     'medallion' — circular framed window
//     'off'       — no fluid; quiet typographic hero
const HomeSection = ({ theme, variant = 'whisper' }) => {
  const heroIntro = (
    <>
      <div className="fl-row" style={{ marginBottom: 20 }}>
        <span className="eyebrow" style={{ color: 'var(--fg-2)' }}>
          <span style={{ color: 'var(--accent-2)' }}>●</span>&nbsp;&nbsp;Anthropic Go-To-Market Team
        </span>
      </div>
      <h1 className="display" style={{ fontSize: 'clamp(40px, 6.5vw, 88px)', margin: 0, fontWeight: 500 }}>
        <span className="reveal-word"><span style={{ animationDelay: '50ms' }}>Quinn</span></span>{' '}
        <span className="reveal-word"><span style={{ animationDelay: '180ms' }}>Woodhead.</span></span>
      </h1>
      <div style={{ marginTop: 20, maxWidth: 620 }}>
        <p className="body-prose" style={{ fontSize: 18, margin: 0 }}>
          <span className="reveal-word"><span style={{ animationDelay: '420ms' }}>Product designer building</span></span>{' '}
          <span className="reveal-word"><span style={{ animationDelay: '500ms' }}>useful, sustainable things.</span></span>
          <br />
          <span className="reveal-word"><span style={{ animationDelay: '620ms', color: 'var(--fg-3)' }}>Water polo on the USA National Team.</span></span>
        </p>
      </div>
      <div className="fl-row" style={{ marginTop: 32, gap: 14, flexWrap: 'wrap' }}>
        <Magnetic>
          <a href="#projects" className="btn primary interactive">
            See selected work
            <span className="arrow"></span>
          </a>
        </Magnetic>
        <Magnetic>
          <a href="#about" className="btn interactive">
            About
          </a>
        </Magnetic>
        <span className="font-mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.08em', marginLeft: 8 }}>
          PRESS <span className="kbd">?</span> FOR SHORTCUTS
        </span>
      </div>
    </>
  );

  const scrollCue = (
    <div className="scroll-cue">
      <span>Scroll</span>
      <div className="line"></div>
    </div>
  );

  // ---- Variant: whisper (subtle full-bleed) ----
  if (variant === 'whisper') {
    const isDark = theme === 'dark';
    return (
      <section id="home" className="hero" data-screen-label="01 Home">
        <div style={{ position: 'absolute', inset: 0, opacity: isDark ? 0.9 : 0.55 }}>
          <FluidHero theme={theme} intensity={isDark ? 0.5 : 0.22} accentBoost={isDark ? 0.45 : 0.18} />
        </div>
        {/* veil — keeps type readable, lighter in dark mode so water shows through */}
        <div style={{
          position:'absolute', inset: 0, zIndex: 1, pointerEvents:'none',
          background: isDark
            ? 'linear-gradient(180deg, color-mix(in oklab, var(--bg) 55%, transparent) 0%, color-mix(in oklab, var(--bg) 25%, transparent) 30%, color-mix(in oklab, var(--bg) 8%, transparent) 70%, color-mix(in oklab, var(--bg) 30%, transparent) 100%)'
            : 'linear-gradient(180deg, color-mix(in oklab, var(--bg) 80%, transparent) 0%, color-mix(in oklab, var(--bg) 55%, transparent) 30%, color-mix(in oklab, var(--bg) 30%, transparent) 70%, color-mix(in oklab, var(--bg) 60%, transparent) 100%)'
        }} />
        <div className="hero-overlay">
          <div className="container">{heroIntro}</div>
        </div>
        {scrollCue}
      </section>
    );
  }

  // ---- Variant: panel (right-side card) ----
  if (variant === 'panel') {
    return (
      <section id="home" className="hero" data-screen-label="01 Home" style={{ background: 'var(--bg)' }}>
        <div className="container" style={{
          height: '100%', display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
          gap: 56, alignItems: 'center',
          paddingTop: 120, paddingBottom: 80,
        }}>
          <div>{heroIntro}</div>
          <div style={{ position:'relative', borderRadius: 22, overflow: 'hidden', border: '1px solid var(--line)', height: 'min(620px, 70vh)', background: 'var(--bg-2)' }}>
            <FluidHero theme={theme} intensity={0.85} accentBoost={0.7} />
            <div style={{ position:'absolute', left: 18, top: 18, zIndex: 2 }}>
              <span className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.08em', color: 'var(--fg-2)', textTransform: 'uppercase', background: 'color-mix(in oklab, var(--bg) 70%, transparent)', padding: '6px 10px', borderRadius: 999, border: '1px solid var(--line)', backdropFilter: 'blur(10px)' }}>
                FIG. 00 — FLUID STUDY
              </span>
            </div>
          </div>
        </div>
        {scrollCue}
      </section>
    );
  }

  // ---- Variant: horizon (bottom band) ----
  if (variant === 'horizon') {
    return (
      <section id="home" className="hero" data-screen-label="01 Home" style={{ background: 'var(--bg)' }}>
        <div className="hero-overlay" style={{ paddingBottom: 'min(360px, 38vh)' }}>
          <div className="container">{heroIntro}</div>
        </div>
        <div style={{
          position:'absolute', left: 0, right: 0, bottom: 0,
          height: 'min(320px, 36vh)',
          borderTop: '1px solid var(--line)', overflow: 'hidden',
        }}>
          <FluidHero theme={theme} intensity={0.75} accentBoost={0.6} />
          <div style={{
            position:'absolute', inset: 0,
            background:'linear-gradient(180deg, color-mix(in oklab, var(--bg) 35%, transparent) 0%, transparent 30%)',
            pointerEvents:'none',
          }} />
          <div style={{ position:'absolute', left: 32, bottom: 22, zIndex: 2 }}>
            <span className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.10em', color: 'var(--fg-2)', textTransform: 'uppercase' }}>
              ⌒  HORIZON
            </span>
          </div>
        </div>
        {scrollCue}
      </section>
    );
  }

  // ---- Variant: medallion (3D sphere) ----
  if (variant === 'medallion') {
    return (
      <section id="home" className="hero" data-screen-label="01 Home" style={{ background: 'var(--bg)' }}>
        <div className="container" style={{
          height: '100%', display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
          gap: 64, alignItems: 'center',
          paddingTop: 120, paddingBottom: 80,
        }}>
          <div>{heroIntro}</div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              position: 'relative',
              width: 'min(480px, 72vw)', aspectRatio: '1/1',
            }}>
              <FluidSphere theme={theme} intensity={0.45} accentBoost={0.35} />
            </div>
            <span className="font-mono" style={{ position:'absolute', top: 8, left: 'calc(50% - 220px)', fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>+ N</span>
            <span className="font-mono" style={{ position:'absolute', bottom: 8, right: 'calc(50% - 220px)', fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>S +</span>
            <span className="font-mono" style={{ position:'absolute', bottom: -28, left: '50%', transform:'translateX(-50%)', fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform: 'uppercase', whiteSpace:'nowrap' }}>
              FIG. 00 · ORB · 2026
            </span>
          </div>
        </div>
        {scrollCue}
      </section>
    );
  }

  // ---- Variant: off ----
  return (
    <section id="home" className="hero" data-screen-label="01 Home" style={{ background: 'var(--bg)' }}>
      <div className="hero-overlay">
        <div className="container">{heroIntro}</div>
      </div>
      {/* quiet typographic ambient: a single hairline + label */}
      <div style={{ position:'absolute', right: 32, top: '32%', display:'flex', alignItems:'center', gap: 14, opacity: 0.7 }}>
        <span className="font-mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform:'uppercase' }}>NO. 04 — SET</span>
        <div style={{ width: 120, height: 1, background:'var(--line-2)' }}></div>
      </div>
      {scrollCue}
    </section>
  );
};

// magnetic wrapper -------------------------------------------
const Magnetic = ({ children }) => {
  // Magnetic motion disabled — buttons stay stationary
  return <span style={{ display: 'inline-flex' }}>{children}</span>;
};
const __MagneticUnused = ({ children, strength = 0.35 }) => {
  const ref = useRef(null);
  const innerRef = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const reach = 110;
      if (dist < reach) {
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
        if (inner) inner.style.transform = `translate(${dx * strength * 0.5}px, ${dy * strength * 0.5}px)`;
      } else {
        el.style.transform = 'translate(0,0)';
        if (inner) inner.style.transform = 'translate(0,0)';
      }
    };
    const onLeave = () => {
      el.style.transform = 'translate(0,0)';
      if (inner) inner.style.transform = 'translate(0,0)';
    };
    window.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);

  // wrap a single child
  const child = React.Children.only(children);
  return (
    <span ref={ref} className="magnetic">
      {React.cloneElement(child, { ref: innerRef })}
    </span>
  );
};

// ABOUT --------------------------------------------------------
const AboutSection = () => {
  const [r1, v1] = useReveal();
  const [r2, v2] = useReveal();
  const [r3, v3] = useReveal();

  const timeline = [
    { year: '2025', title: 'Joined Anthropic', body: 'Go-to-market team. Designing on the side.', accent: true },
    { year: '2024', title: 'Paris Olympics alternate', body: 'Alternate for the Paris Olympics. Pro season with Telimar Pallanuoto in Italy.' },
    { year: '2023', title: 'Pro debut · Pan-Am gold', body: 'Pro season with ANO Glyfada in Greece. Gold at the Pan-American Games in Santiago.' },
    { year: '2022', title: 'Stanford · 1st Team All-American', body: 'B.S. Product Design from the School of Engineering. Named ACWPC 1st Team All-American.' },
    { year: '2019', title: 'NCAA National Champions', body: 'National title with Stanford Men\'s Water Polo.' },
  ];

  return (
    <section id="about" className="section" data-screen-label="02 About" style={{ background: 'var(--bg)' }}>
      <div className="container">
        <div ref={r1} className={`fade-in ${v1 ? 'in' : ''}`}>
          <div className="eyebrow" style={{ marginBottom: 24 }}>02 — About</div>
          <h2 className="display" style={{ fontSize: 'clamp(28px, 3.6vw, 48px)', maxWidth: 880, margin: 0, fontWeight: 500 }}>
            Product designer based in California. Currently on the <em style={{ color: 'var(--accent-2)', fontStyle: 'italic', fontWeight: 500 }}>go-to-market team at Anthropic</em>.
          </h2>
        </div>

        {/* asymmetric two-col body */}
        <div ref={r2} className={`fade-in ${v2 ? 'in' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: 64, marginTop: 56 }}>
          <div style={{ position: 'relative' }}>
            {/* portrait placeholder */}
            <div className="ph" style={{ aspectRatio: '4/5', borderRadius: 14 }}>
              <span className="ph-label">[PORTRAIT — 4:5]</span>
            </div>
          </div>
          <div className="col" style={{ gap: 24, paddingTop: 4 }}>
            <p className="body-prose">I'm Quinn — a Stanford-trained product designer, a water polo player on the USA National Team, and currently on the go-to-market team at Anthropic. The throughline between design and sport: <em>discipline, repetition, and reading flow under pressure.</em></p>
            <p className="body-prose">I spent the years after Stanford competing internationally — pro seasons in Greece and Italy, alternate for the 2024 Paris Olympics — while making things on the side. Outside of work, I'm still in the pool, still designing, still making things by hand.</p>
          </div>
        </div>

        {/* timeline */}
        <div ref={r3} className={`fade-in ${v3 ? 'in' : ''}`} style={{ marginTop: 80, display: 'grid', gridTemplateColumns: '200px 1fr', gap: 64 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>§ Recent</div>
            <div className="font-serif" style={{ fontSize: 18, lineHeight: 1.4, color: 'var(--fg-2)', fontWeight: 400 }}>
              The last few years.
            </div>
          </div>
          <div className="timeline">
            {timeline.map((t, i) => (
              <div key={i} className={`timeline-item ${t.accent ? 'accent' : ''}`}>
                <div className="font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: t.accent ? 'var(--accent-2)' : 'var(--fg-3)', marginBottom: 6, textTransform: 'uppercase' }}>
                  {t.year}{t.accent && '  ·  CURRENT'}
                </div>
                <h3 className="font-serif" style={{ fontSize: 18, fontWeight: 500, margin: '0 0 6px 0', letterSpacing: '-0.005em' }}>
                  {t.title}
                </h3>
                <p className="body-prose" style={{ fontSize: 15, margin: 0, maxWidth: 540 }}>{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// PROJECTS -----------------------------------------------------
const ProjectsSection = () => {
  const [r1, v1] = useReveal();
  const [r2, v2] = useReveal();

  const others = [
    { num: '02', title: 'Oyster Shucker', kind: 'Tool redesign', year: '2021', stack: 'Steel · Resin · CAD' },
    { num: '03', title: 'The Pulling Robot', kind: 'Robotics', year: '2020', stack: 'Arduino · Servos · Custom housing' },
    { num: '04', title: 'The Air Cam', kind: 'Aerial hardware', year: '2020', stack: 'CAD · Stabilization' },
    { num: '05', title: 'Bi-Stable Switch', kind: 'Mechanism', year: '2020', stack: 'Snap-fit · ABS · Tolerances' },
  ];

  return (
    <section id="projects" className="section" data-screen-label="03 Projects" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div className="container">
        <div ref={r1} className={`fade-in ${v1 ? 'in' : ''}`} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 18 }}>03 — Selected work</div>
            <h2 className="display" style={{ fontSize: 'clamp(28px, 3.6vw, 48px)', margin: 0, maxWidth: 760, fontWeight: 500 }}>
              Things I've built.
            </h2>
          </div>
          <div className="font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
            01 / 05 &nbsp; FEATURED
          </div>
        </div>

        {/* FEATURED — Mobi */}
        <div ref={r2} className={`fade-in ${v2 ? 'in' : ''}`} style={{ marginTop: 56 }}>
          <article className="project-card interactive" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)' }}>
              {/* left: hero image */}
              <div className="ph" style={{ aspectRatio: '4/3.2', border: 'none', borderRadius: 0, borderRight: '1px solid var(--line)' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 14 }}>
                  <div style={{
                    fontFamily: 'Lora, serif', fontSize: 56, fontWeight: 600, letterSpacing: '-0.04em',
                    color: 'var(--fg)', display: 'flex', alignItems: 'baseline'
                  }}>
                    Mob<span style={{ color: 'var(--accent-2)' }}>i</span>
                  </div>
                  <span className="ph-label">[HERO SHOT — Mobi prototype]</span>
                </div>
              </div>
              {/* right: case study */}
              <div style={{ padding: '36px 36px', display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div className="fl-row" style={{ justifyContent: 'space-between' }}>
                  <span className="font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--accent)', textTransform: 'uppercase' }}>
                    01 — FEATURED
                  </span>
                  <span className="font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
                    2021 — STANFORD ME
                  </span>
                </div>
                <h3 className="display" style={{ fontSize: 'clamp(26px, 2.8vw, 38px)', margin: 0, fontWeight: 500 }}>
                  Mobi
                </h3>
                <p className="body-prose" style={{ margin: 0, fontSize: 17 }}>
                  A travel-sized recovery tool that lives in a duffel without giving up <em>performance</em>. Designed for athletes who train on the road.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', rowGap: 18, columnGap: 20, marginTop: 8, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
                  <div className="eyebrow">Problem</div>
                  <p className="body-prose" style={{ fontSize: 16, margin: 0, color: 'var(--fg-2)' }}>
                    Foam rollers are bulky. Athletes leave them at home when they travel. The result: skipped recovery and worse performance on the road.
                  </p>
                  <div className="eyebrow">Approach</div>
                  <p className="body-prose" style={{ fontSize: 16, margin: 0, color: 'var(--fg-2)' }}>
                    A compact form that breaks down into stackable rings. Optimized for weight, ease of use, and the muscle groups athletes actually need.
                  </p>
                  <div className="eyebrow">Outcome</div>
                  <p className="body-prose" style={{ fontSize: 16, margin: 0, color: 'var(--fg-2)' }}>
                    Functional prototype tested with college athletes. Roughly four times smaller packed than competitor products at full size when assembled.
                  </p>
                </div>

                <div className="fl-row meta-reveal" style={{ marginTop: 12, gap: 18, flexWrap: 'wrap' }}>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>STACK ·</span>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>SolidWorks</span>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>·</span>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>Foam · Resin</span>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>·</span>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>Iterated prototypes</span>
                </div>

                <Magnetic>
                  <a href="#" className="btn primary interactive" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                    Read the full case study
                    <span className="arrow"></span>
                  </a>
                </Magnetic>
              </div>
            </div>
          </article>
        </div>

        {/* other projects */}
        <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24 }}>
          {others.map((p, i) => (
            <ProjectCard key={i} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProjectCard = ({ project }) => {
  const [hover, setHover] = useState(false);
  return (
    <article
      className="project-card interactive"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="ph" style={{ aspectRatio: '16/10', border: 'none', borderRadius: 0, borderBottom: '1px solid var(--line)' }}>
        <span className="ph-label">[PROJECT IMAGE — {project.num}]</span>
      </div>
      <div style={{ padding: '28px 28px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="fl-row" style={{ justifyContent: 'space-between' }}>
          <span className="font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
            {project.num} — {project.kind}
          </span>
          <span className="font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-3)' }}>
            {project.year}
          </span>
        </div>
        <h3 className="font-serif" style={{ fontSize: 28, fontWeight: 500, margin: 0, letterSpacing: '-0.015em' }}>
          {project.title}
        </h3>
        <div className="meta-reveal font-mono" style={{ fontSize: 12, color: 'var(--fg-2)', marginTop: 4 }}>
          {project.stack}
          <span style={{ marginLeft: 12, color: 'var(--accent)' }}>→ View</span>
        </div>
      </div>
    </article>
  );
};

// ATHLETICS ---------------------------------------------------
const ATHLETIC_MILESTONES = [
  { id: 'm1', x: 0.08, y: 0.32, year: '2013', code: 'DRK', org: 'Drake H.S.',           title: 'First practice',          oneLiner: 'Started water polo with the Drake high school program.' },
  { id: 'm2', x: 0.22, y: 0.62, year: '2017', code: 'DRK', org: 'Drake H.S.',           title: 'NorCal Champions',        oneLiner: 'CIF NCS Division 1. NISCA 1st Team All-American. MCAL Player of the Year.' },
  { id: 'm3', x: 0.36, y: 0.28, year: '2018', code: 'STN', org: 'Stanford',             title: 'Joined Stanford',         oneLiner: 'First senior college season with the men\'s water polo team.' },
  { id: 'm4', x: 0.50, y: 0.55, year: '2019', code: 'STN', org: 'Stanford',             title: 'NCAA National Champions', oneLiner: 'Stanford takes the title. ACWPC All-American as a sophomore.' },
  { id: 'm5', x: 0.64, y: 0.38, year: '2022', code: 'STN', org: 'Stanford',             title: '1st Team All-American',   oneLiner: 'Three years as Stanford captain. ACWPC 1st Team All-American. B.S. Product Design.' },
  { id: 'm6', x: 0.78, y: 0.65, year: '2023', code: 'GRC', org: 'ANO Glyfada · Greece', title: 'Pro debut · Pan-Am gold', oneLiner: 'Pro season with ANO Glyfada. Gold at the Pan-American Games in Santiago.' },
  { id: 'm7', x: 0.92, y: 0.34, year: '2024', code: 'ITA', org: 'Telimar · Italy · USA',title: 'Paris alternate',         oneLiner: 'Alternate for the Paris Olympics. Pro season with Telimar Pallanuoto.' },
];

const AthleticsSection = ({ theme }) => {
  const [r1, v1] = useReveal();
  const [r2, v2] = useReveal();
  const [r3, v3] = useReveal();
  const ribbonRef = useRef(null);
  const ribbonWrapRef = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const [seenIds, setSeenIds] = useState(() => new Set());

  const handleBuoy = (m) => {
    setActiveId(m.id);
    setSeenIds(prev => {
      if (prev.has(m.id)) return prev;
      const s = new Set(prev); s.add(m.id); return s;
    });
    // spawn a small, cheap ripple after state commits so the click feels instant
    requestAnimationFrame(() => {
      const wrap = ribbonWrapRef.current;
      if (wrap && ribbonRef.current?.spawnRipple) {
        ribbonRef.current.spawnRipple(m.x * wrap.clientWidth, m.y * wrap.clientHeight, { amp: 0.6 });
      }
    });
  };

  const active = ATHLETIC_MILESTONES.find(m => m.id === activeId);

  const seasons = [
    { year: '2024', team: 'Telimar Pallanuoto', league: 'Italian A1', role: 'Pro · 2nd Round Euro Cup', honor: '7th in A1' },
    { year: '2023', team: 'ANO Glyfada',        league: 'Greek A1',   role: 'Pro · Pan-Am gold',       honor: '9th in A1' },
    { year: '2022', team: 'Stanford',           league: 'NCAA D1',    role: 'Captain · 1st Team A-A',  honor: 'NCAA Tourney' },
    { year: '2020', team: 'Stanford',           league: 'NCAA D1',    role: 'Captain',                 honor: 'MPSF Champs' },
    { year: '2019', team: 'Stanford',           league: 'NCAA D1',    role: 'All-American',            honor: 'NCAA Champions' },
  ];

  return (
    <section id="athletics" className="section athletics-themed" data-screen-label="04 Athletics" style={{ background: 'var(--bg)' }}>
      <div className="container">
        <div ref={r1} className={`fade-in ${v1 ? 'in' : ''}`}>
          <div className="eyebrow" style={{ marginBottom: 24 }}>04 — Athletics</div>
          <h2 className="display" style={{ fontSize: 'clamp(28px, 3.6vw, 48px)', margin: 0, maxWidth: 880, fontWeight: 500 }}>
            17 years in the pool. Drake, Stanford, Greece, Italy, USA.
          </h2>
        </div>

        {/* affiliations — Stanford + USA Water Polo */}
        <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {/* Stanford card — cardinal */}
          <div style={{
            position: 'relative',
            padding: '26px 28px',
            border: '1px solid #8C1515',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #8C1515 0%, #6e1010 100%)',
            color: '#fff',
            overflow: 'hidden',
          }}>
            <div style={{ position:'absolute', inset: 0, opacity: 0.08, background: 'radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)' }}></div>
            <div className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.85, marginBottom: 14 }}>
              ↳ University · NCAA D1
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 8,
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <LogoOrFallback
                  src="/portfolio/logos/stanford.png"
                  alt="Stanford"
                  imgStyle={{ maxWidth: '70%', maxHeight: '70%', objectFit: 'contain' }}
                  fallback={<span style={{ fontFamily: 'Lora, serif', fontWeight: 700, fontSize: 32, fontStyle: 'italic', color: '#fff' }}>S</span>}
                />
              </div>
              <div>
                <div className="font-serif" style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.01em' }}>Stanford Water Polo</div>
                <div className="font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.78, marginTop: 6, textTransform: 'uppercase' }}>2018 — 2022 · Three-time captain</div>
              </div>
            </div>
            <p style={{ fontFamily: 'Lora, serif', fontSize: 14.5, lineHeight: 1.55, marginTop: 18, marginBottom: 0, opacity: 0.92 }}>
              NCAA National Champions 2019. Four-time ACWPC All-American (1st Team 2022). Three-time MPSF Conference Champions.
            </p>
          </div>

          {/* USA Water Polo card — navy/red */}
          <div style={{
            position: 'relative',
            padding: '26px 28px',
            border: '1px solid #002868',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #002868 0%, #001b48 100%)',
            color: '#fff',
            overflow: 'hidden',
          }}>
            {/* small flag stripe accent */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 6, height: '100%', background: 'linear-gradient(180deg, #BF0A30 0%, #BF0A30 33%, #fff 33%, #fff 66%, #002868 66%, #002868 100%)' }}></div>
            <div className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.85, marginBottom: 14 }}>
              ↳ National program
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#BF0A30',
                border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <LogoOrFallback
                  src="/portfolio/logos/usa-water-polo.png"
                  alt="USA Water Polo"
                  imgStyle={{ maxWidth: '70%', maxHeight: '70%', objectFit: 'contain' }}
                  fallback={<span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 18, letterSpacing: '0.04em', color: '#fff' }}>USA</span>}
                />
              </div>
              <div>
                <div className="font-serif" style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.01em' }}>USA Water Polo</div>
                <div className="font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.78, marginTop: 6, textTransform: 'uppercase' }}>Senior National Team · 2024 Paris alternate</div>
              </div>
            </div>
            <p style={{ fontFamily: 'Lora, serif', fontSize: 14.5, lineHeight: 1.55, marginTop: 18, marginBottom: 0, opacity: 0.92 }}>
              Two-time World Championship participant (2023, 2024). Gold at 2023 Pan-American Games. Gold at 2022 Intercontinental Cup.
            </p>
          </div>
        </div>


        {/* aquatic ribbon w/ career buoys */}
        <div ref={r2} className={`fade-in ${v2 ? 'in' : ''}`} style={{ marginTop: 48 }}>
          <div className="fl-row" style={{ justifyContent:'space-between', alignItems:'baseline', marginBottom: 14 }}>
            <span className="eyebrow">§ Career timeline</span>
            <span className="font-mono" style={{ fontSize: 11, letterSpacing: '0.10em', color: 'var(--accent-2)', textTransform: 'uppercase' }}>
              Click each year
            </span>
          </div>
          <div ref={ribbonWrapRef} className="aqua-ribbon" style={{ height: 240 }}>
            <AquaRibbon ref={ribbonRef} theme={theme} />
            {/* buoys */}
            {ATHLETIC_MILESTONES.map(m => {
              const seen = seenIds.has(m.id);
              const isActive = m.id === activeId;
              return (
                <div
                  key={m.id}
                  style={{
                    position: 'absolute',
                    left: `${m.x * 100}%`, top: `${m.y * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 3,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    pointerEvents: 'none',
                  }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleBuoy(m); }}
                    className="interactive"
                    style={{
                      pointerEvents: 'auto',
                      width: 32, height: 32,
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    aria-label={`${m.year} — ${m.title}`}
                  >
                    <span style={{
                      width: isActive ? 18 : 14, height: isActive ? 18 : 14,
                      borderRadius: '50%',
                      background: isActive
                        ? 'var(--accent-2)'
                        : seen ? 'color-mix(in oklab, var(--accent-2) 55%, var(--bg))' : 'var(--bg)',
                      border: `1.5px solid var(--accent-2)`,
                      boxShadow: isActive
                        ? '0 0 0 6px color-mix(in oklab, var(--accent-2) 22%, transparent)'
                        : '0 0 0 0 color-mix(in oklab, var(--accent-2) 0%, transparent)',
                      transition: 'background 180ms ease, width 180ms ease, height 180ms ease, box-shadow 220ms ease',
                      pointerEvents: 'none',
                    }} />
                  </button>
                  <span className="font-mono" style={{
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    color: isActive ? 'var(--accent-2)' : 'var(--fg-2)',
                    fontWeight: isActive ? 600 : 500,
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    background: 'color-mix(in oklab, var(--bg) 75%, transparent)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    backdropFilter: 'blur(4px)',
                  }}>
                    {m.year} · {m.code}
                  </span>
                </div>
              );
            })}

            {/* active card overlay */}
            {active && (
              <div
                key={active.id}
                style={{
                  position: 'absolute',
                  left: `${active.x * 100}%`,
                  top: `${active.y * 100}%`,
                  transform: `translate(${active.x > 0.7 ? 'calc(-100% - 18px)' : '24px'}, ${active.y > 0.55 ? 'calc(-100% - 18px)' : '18px'})`,
                  width: 'min(280px, 56vw)',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  boxShadow: '0 18px 50px -18px color-mix(in oklab, var(--fg) 30%, transparent)',
                  zIndex: 4,
                  animation: 'plFade 320ms cubic-bezier(.2,.8,.2,1) forwards',
                  opacity: 0,
                }}
              >
                <div className="fl-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="fl-row" style={{ gap: 8 }}>
                    <span className="font-mono" style={{
                      fontSize: 10,
                      letterSpacing: '0.08em',
                      fontWeight: 700,
                      color: 'var(--accent-fg)',
                      background: 'var(--accent-2)',
                      padding: '3px 7px',
                      borderRadius: 999,
                    }}>{active.code}</span>
                    <span className="font-mono" style={{ fontSize: 10.5, color: 'var(--accent-2)', letterSpacing: '0.10em', fontWeight: 500 }}>
                      {active.year}
                    </span>
                  </span>
                  <button
                    onClick={() => setActiveId(null)}
                    className="interactive"
                    style={{
                      background:'transparent', border:'none', color:'var(--fg-3)',
                      fontFamily:'JetBrains Mono, monospace', fontSize: 12, cursor:'pointer', padding: 0, lineHeight: 1,
                    }}
                  >×</button>
                </div>
                <div className="font-serif" style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.005em', marginBottom: 4 }}>
                  {active.title}
                </div>
                <div className="font-mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>
                  {active.org}
                </div>
                <div className="font-serif" style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.45 }}>
                  {active.oneLiner}
                </div>
              </div>
            )}

            {/* progress */}
            <div style={{ position: 'absolute', right: 16, bottom: 12, pointerEvents: 'none' }}>
              <div className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.10em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
                {seenIds.size} / {ATHLETIC_MILESTONES.length} read
              </div>
            </div>
          </div>
        </div>

        {/* highlights + stats */}
        <div ref={r3} className={`fade-in ${v3 ? 'in' : ''}`} style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: 56 }}>
          {/* career highlights */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>§ Career highlights</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { yr: '2024', title: 'Paris Olympics alternate',     sub: 'Selected as alternate for the 2024 Paris Olympics.' },
                { yr: '2023', title: 'Pan-American Games gold',      sub: 'Gold medal in Santiago, Chile with the USA Senior National Team.' },
                { yr: '2022', title: 'ACWPC 1st Team All-American',  sub: 'Recognized as one of the top players in NCAA water polo.' },
                { yr: '2019', title: 'NCAA National Champions',      sub: 'Won the national title with Stanford Men\'s Water Polo.' },
              ].map((h, i) => (
                <li key={i} style={{ padding: '16px 0', borderBottom: '1px solid var(--line)', display: 'grid', gridTemplateColumns: '64px 1fr', gap: 20, alignItems: 'baseline' }}>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--accent-2)', letterSpacing: '0.08em', fontWeight: 500 }}>{h.yr}</span>
                  <div>
                    <div className="font-serif" style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.005em', marginBottom: 2 }}>{h.title}</div>
                    <div className="body-prose" style={{ fontSize: 14, margin: 0 }}>{h.sub}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 32 }}>
              <div className="ph" style={{ aspectRatio: '4/3', borderRadius: 14 }}>
                <span className="ph-label">[ACTION PHOTO — match day]</span>
              </div>
            </div>
          </div>

          {/* stats data display */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>§ Seasons · stat sheet</div>
            <div className="stat-row head font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
              <span>Year</span>
              <span>Squad</span>
              <span>Role</span>
              <span style={{ textAlign: 'right' }}>League</span>
              <span style={{ textAlign: 'right' }}>Honor</span>
            </div>
            {seasons.map((s, i) => (
              <div key={i} className="stat-row" style={{ borderBottomColor: 'var(--line)' }}>
                <span className="font-mono" style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500 }}>{s.year}</span>
                <span className="font-serif" style={{ fontSize: 18, fontWeight: 500 }}>{s.team}</span>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {s.role}
                </span>
                <span className="font-mono" style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', color: 'var(--fg-2)' }}>{s.league}</span>
                <span className="font-mono" style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', color: 'var(--fg)', letterSpacing: '0.02em' }}>
                  {s.honor}
                </span>
              </div>
            ))}

            <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, paddingTop: 28, borderTop: '1px solid var(--fg)' }}>
              {[
                { v: '17',  l: 'Years competing' },
                { v: '4×',  l: 'All-American' },
                { v: '1',   l: 'NCAA title' },
              ].map((k, i) => (
                <div key={i}>
                  <div className="font-serif" style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, fontFeatureSettings: '"tnum"' }}>
                    {k.v}
                  </div>
                  <div className="font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-3)', textTransform: 'uppercase', marginTop: 8 }}>
                    {k.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const __unused_athletics_dup = () => {
  return (
    <>
        {/* highlights + stats */}
        <div style={{ marginTop: 96, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: 80 }}>
          {/* career highlights */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>§ Career highlights</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { yr: '2024', title: 'Paris Olympics alternate',     sub: 'Selected as alternate for the 2024 Paris Olympics.' },
                { yr: '2023', title: 'Pan-American Games gold',      sub: 'Gold medal in Santiago, Chile with the USA Senior National Team.' },
                { yr: '2022', title: 'ACWPC 1st Team All-American',  sub: 'Recognized as one of the top players in NCAA water polo.' },
                { yr: '2019', title: 'NCAA National Champions',      sub: 'Won the national title with Stanford Men\'s Water Polo.' },
              ].map((h, i) => (
                <li key={i} style={{ padding: '16px 0', borderBottom: '1px solid var(--line)', display: 'grid', gridTemplateColumns: '64px 1fr', gap: 20, alignItems: 'baseline' }}>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--accent-2)', letterSpacing: '0.08em', fontWeight: 500 }}>{h.yr}</span>
                  <div>
                    <div className="font-serif" style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.005em', marginBottom: 2 }}>{h.title}</div>
                    <div className="body-prose" style={{ fontSize: 14, margin: 0 }}>{h.sub}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 32 }}>
              <div className="ph" style={{ aspectRatio: '4/3', borderRadius: 14 }}>
                <span className="ph-label">[ACTION PHOTO — match day]</span>
              </div>
            </div>
          </div>

          {/* stats data display */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>§ Seasons · stat sheet</div>
            <div className="stat-row head font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
              <span>Year</span>
              <span>Squad</span>
              <span>Role</span>
              <span style={{ textAlign: 'right' }}>League</span>
              <span style={{ textAlign: 'right' }}>Honor</span>
            </div>
            {seasons.map((s, i) => (
              <div key={i} className="stat-row" style={{ borderBottomColor: 'var(--line)' }}>
                <span className="font-mono" style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500 }}>{s.year}</span>
                <span className="font-serif" style={{ fontSize: 18, fontWeight: 500 }}>{s.team}</span>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {s.role}
                </span>
                <span className="font-mono" style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', color: 'var(--fg-2)' }}>{s.league}</span>
                <span className="font-mono" style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', color: 'var(--fg)', letterSpacing: '0.02em' }}>
                  {s.honor}
                </span>
              </div>
            ))}

            <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, paddingTop: 36, borderTop: '1px solid var(--fg)' }}>
              {[
                { v: '17',  l: 'Years competing' },
                { v: '4×',  l: 'All-American' },
                { v: '1',   l: 'NCAA title' },
              ].map((k, i) => (
                <div key={i}>
                  <div className="font-serif" style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, fontFeatureSettings: '"tnum"' }}>
                    {k.v}
                  </div>
                  <div className="font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-3)', textTransform: 'uppercase', marginTop: 8 }}>
                    {k.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </>
  );
};

// FOOTER -----------------------------------------------------
const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', padding: '56px 0 32px', background: 'var(--bg)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 40 }}>
        <div>
          <div className="display" style={{ fontSize: 'clamp(24px, 3.2vw, 40px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Currently on the <em style={{ fontStyle: 'italic', color: 'var(--accent-2)' }}>go-to-market team</em> at Anthropic.
          </div>
          <div style={{ marginTop: 28 }}>
            <Magnetic>
              <a href="mailto:qwoodhead@gmail.com" className="btn primary interactive">
                qwoodhead@gmail.com
                <span className="arrow"></span>
              </a>
            </Magnetic>
            <Magnetic>
              <a href="[RESUME PDF URL]" download className="btn interactive" style={{ marginLeft: 12 }}>
                Download résumé
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.08em' }}>PDF · 180 KB</span>
              </a>
            </Magnetic>
          </div>
        </div>
        <div className="col" style={{ gap: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ Index</div>
          {['Home', 'About', 'Projects', 'Athletics'].map((l, i) => (
            <a key={i} href={`#${l.toLowerCase()}`} className="font-serif interactive" style={{ color: 'var(--fg)', textDecoration: 'none', fontSize: 17 }}>
              {String(i+1).padStart(2,'0')} &nbsp; {l}
            </a>
          ))}
        </div>
        <div className="col" style={{ gap: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>§ Elsewhere</div>
          {[
            { l: 'LinkedIn',  v: '↗ linkedin',  href: 'https://www.linkedin.com/in/quinn-woodhead-b6558817a/', external: true },
            { l: 'Email',     v: '↗ qwoodhead@…', href: 'mailto:qwoodhead@gmail.com' },
            { l: 'Résumé',    v: '↓ résumé.pdf' },
            { l: 'Coach',     v: '→ coach portal', href: '/coach-portal.html', external: true },
          ].map((s, i) => (
            <a
              key={i}
              href={s.l === 'Résumé' ? '[RESUME PDF URL]' : (s.href || '#')}
              {...(s.l === 'Résumé' ? { download: true } : {})}
              {...(s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="font-serif interactive"
              style={{ color: 'var(--fg)', textDecoration: 'none', fontSize: 17 }}
            >
              {s.v}
            </a>
          ))}
        </div>
      </div>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
        <span className="font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
          © 2026 — Quinn Woodhead
        </span>
        <span className="font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
          Lora · JetBrains Mono
        </span>
      </div>
    </footer>
  );
};

window.HomeSection = HomeSection;
window.AboutSection = AboutSection;
window.ProjectsSection = ProjectsSection;
window.AthleticsSection = AthleticsSection;
window.Footer = Footer;
window.Magnetic = Magnetic;
