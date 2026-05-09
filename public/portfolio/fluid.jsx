/* global React, THREE */
// ─────────────────────────────────────────────
//  Fluid hero — Three.js shader plane
//  Mouse-reactive ripples, soft caustics, refraction
// ─────────────────────────────────────────────

const FluidHero = ({ theme, intensity = 0.55, accentBoost = 0.5 }) => {
  const containerRef = React.useRef(null);
  const stateRef = React.useRef({
    mouse: { x: 0.5, y: 0.5, vx: 0, vy: 0, lx: 0.5, ly: 0.5 },
    ripples: [],
    fallback: false,
  });

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof THREE === 'undefined') {
      stateRef.current.fallback = true;
      return;
    }

    // device check ----------------------------
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      stateRef.current.fallback = true;
      return;
    }
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Theme-driven colors -------------------------
    const themeColors = {
      light: {
        a: new THREE.Color(0xeef1f6), // pale cool cream
        b: new THREE.Color(0xc8d2e2), // soft steel
        c: new THREE.Color(0x8aa1c4), // mid blue
        accent: new THREE.Color(0x254a8a), // deep navy
      },
      dark: {
        a: new THREE.Color(0x0c1124), // abyssal navy
        b: new THREE.Color(0x14213d), // deep ink-blue
        c: new THREE.Color(0x1f3a6d), // ocean depth
        accent: new THREE.Color(0x6da3ff), // bright steel-blue
      },
    };

    const uniforms = {
      u_time:     { value: 0 },
      u_res:      { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
      u_mouse:    { value: new THREE.Vector2(0.5, 0.5) },
      u_mvel:     { value: new THREE.Vector2(0, 0) },
      u_ripples:  { value: Array.from({ length: 6 }, () => new THREE.Vector4(0, 0, 0, 0)) },
      u_a:        { value: themeColors[theme].a },
      u_b:        { value: themeColors[theme].b },
      u_c:        { value: themeColors[theme].c },
      u_accent:   { value: themeColors[theme].accent },
      u_dark:     { value: theme === 'dark' ? 1 : 0 },
      u_intensity:{ value: (isMobile ? 0.7 : 1.0) * intensity },
      u_accentBoost:{ value: accentBoost },
    };

    const vert = /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const frag = /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float u_time;
      uniform vec2  u_res;
      uniform vec2  u_mouse;
      uniform vec2  u_mvel;
      uniform vec4  u_ripples[6];
      uniform vec3  u_a;
      uniform vec3  u_b;
      uniform vec3  u_c;
      uniform vec3  u_accent;
      uniform float u_dark;
      uniform float u_intensity;
      uniform float u_accentBoost;

      // simplex noise (Ashima)
      vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
      vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
      vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
                                + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      // fbm
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for(int i=0;i<5;i++) {
          v += a * snoise(p);
          p *= 2.02;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = vUv;
        vec2 p  = uv;
        float aspect = u_res.x / u_res.y;
        p.x *= aspect;

        float t = u_time * 0.10;

        // base flow field — slow, layered
        vec2 q;
        q.x = fbm(p * 1.6 + vec2(0.0, t));
        q.y = fbm(p * 1.6 + vec2(5.2, t * 1.2));

        vec2 r;
        r.x = fbm(p * 2.4 + 1.7 * q + vec2(1.7, 9.2) + t * 0.4);
        r.y = fbm(p * 2.4 + 1.7 * q + vec2(8.3, 2.8) + t * 0.3);

        float f = fbm(p * 1.4 + r);

        // mouse displacement — long-range pull (gentle)
        vec2 m = u_mouse;
        m.x *= aspect;
        float md = distance(p, m);
        float mInf = exp(-md * 2.8) * 0.32;
        f += mInf * sin(u_time * 1.2 - md * 7.5) * 0.22;

        // ripples — short-lived radial waves
        for (int i=0; i<6; i++) {
          vec4 rp = u_ripples[i];
          if (rp.w <= 0.0) continue;
          vec2 rc = vec2(rp.x * aspect, rp.y);
          float rd = distance(p, rc);
          float age = u_time - rp.z;
          float radius = age * 0.42;
          float band = exp(-pow((rd - radius) * 14.0, 2.0));
          float life = clamp(1.0 - age / 2.4, 0.0, 1.0);
          f += band * life * rp.w * 0.55;
        }

        // caustics — bright thin highlights
        float caustic = abs(sin(f * 4.6 + u_time * 0.55));
        caustic = pow(caustic, 16.0);

        // base gradient
        float g = smoothstep(-0.2, 0.6, f);
        vec3 col = mix(u_a, u_b, g);
        col = mix(col, u_c, smoothstep(0.35, 0.95, g + length(r) * 0.18));

        // depth shading (vignette-ish, but soft)
        float vig = 1.0 - smoothstep(0.4, 1.4, length((uv - 0.5) * vec2(aspect, 1.0)));
        col *= mix(0.86, 1.05, vig);

        // caustic highlights (more visible in dark)
        vec3 highlight = mix(vec3(1.0, 0.96, 0.88), u_accent, 0.20);
        float causticStrength = mix(0.10, 0.36, u_dark);
        col += caustic * highlight * causticStrength * u_intensity * u_accentBoost;

        // accent kiss near mouse
        col += u_accent * mInf * 0.06 * u_accentBoost;

        // grain
        float grain = (fract(sin(dot(uv.xy + u_time * 0.001, vec2(12.9898,78.233))) * 43758.5453) - 0.5);
        col += grain * 0.012;

        // soft top fade so the type sits cleanly
        float topFade = smoothstep(0.0, 0.35, uv.y);
        col = mix(col * 0.92, col, topFade);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const geom = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms,
    });
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);

    // resize -------------------------------
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.u_res.value.set(w, h);
    };
    window.addEventListener('resize', onResize);

    // mouse ---------------------------------
    let lastTime = performance.now();
    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      stateRef.current.mouse.x = x;
      stateRef.current.mouse.y = y;
    };

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      const ripples = stateRef.current.ripples;
      ripples.push({ x, y, t: uniforms.u_time.value, amp: 1.0 });
      if (ripples.length > 6) ripples.shift();
    };

    window.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    // touch support
    const onTouch = (e) => {
      const t = e.touches[0];
      if (!t) return;
      const rect = container.getBoundingClientRect();
      const x = (t.clientX - rect.left) / rect.width;
      const y = 1.0 - (t.clientY - rect.top) / rect.height;
      stateRef.current.mouse.x = x;
      stateRef.current.mouse.y = y;
    };
    container.addEventListener('touchmove', onTouch, { passive: true });

    // animate -------------------------------
    let raf;
    let running = true;
    const start = performance.now();

    const tick = () => {
      if (!running) return;
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const elapsed = (now - start) / 1000;
      uniforms.u_time.value = elapsed;

      // ease mouse
      const mouse = stateRef.current.mouse;
      mouse.lx += (mouse.x - mouse.lx) * 0.06;
      mouse.ly += (mouse.y - mouse.ly) * 0.06;
      mouse.vx = mouse.x - mouse.lx;
      mouse.vy = mouse.y - mouse.ly;
      uniforms.u_mouse.value.set(mouse.lx, mouse.ly);
      uniforms.u_mvel.value.set(mouse.vx, mouse.vy);

      // sync ripples
      const slots = uniforms.u_ripples.value;
      for (let i = 0; i < 6; i++) {
        const rip = stateRef.current.ripples[i];
        if (rip) {
          slots[i].set(rip.x, rip.y, rip.t, rip.amp);
        } else {
          slots[i].set(0, 0, 0, 0);
        }
      }
      // age out
      stateRef.current.ripples = stateRef.current.ripples.filter(r => (elapsed - r.t) < 2.5);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    if (reduced) {
      // single frame
      uniforms.u_time.value = 6.0;
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(tick);
    }

    // cleanup ---------------------------------
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      container.removeEventListener('touchmove', onTouch);
      geom.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [theme]);

  return (
    <div ref={containerRef} className="hero-canvas">
      {/* graceful fallback gradient — invisible if WebGL works */}
      <div style={{
        position:'absolute', inset:0,
        background:'radial-gradient(120% 100% at 50% 100%, color-mix(in oklab, var(--accent) 14%, var(--bg)) 0%, var(--bg) 60%, var(--bg) 100%)',
        zIndex: -1,
      }} />
    </div>
  );
};

// Aquatic ribbon — small 2D canvas ripple effect for athletics page ----
const AquaRibbon = React.forwardRef(({ theme }, ref) => {
  const canvasRef = React.useRef(null);
  const ripplesRef = React.useRef([]);

  React.useImperativeHandle(ref, () => ({
    spawnRipple(x, y, opts = {}) {
      ripplesRef.current.push({ x, y, t: 0, life: 1, amp: opts.amp || 1.4 });
      if (ripplesRef.current.length > 12) ripplesRef.current.shift();
    },
  }), []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let running = true;
    const ripples = ripplesRef.current;
    let mouse = { x: -9999, y: -9999, active: false };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999; };
    const onClick = (e) => {
      const r = canvas.getBoundingClientRect();
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: 0, life: 1, amp: 1 });
      if (ripples.length > 12) ripples.shift();
    };
    const onTouch = (e) => {
      const tt = e.touches[0]; if (!tt) return;
      const r = canvas.getBoundingClientRect();
      mouse.x = tt.clientX - r.left; mouse.y = tt.clientY - r.top; mouse.active = true;
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('touchend', onLeave);

    const accent = theme === 'dark' ? 'rgba(109,163,255,0.55)' : 'rgba(37,74,138,0.40)';
    const accentHot = theme === 'dark' ? 'rgba(140,185,255,0.95)' : 'rgba(37,74,138,0.85)';
    const line = theme === 'dark' ? 'rgba(180,200,230,0.07)' : 'rgba(20,30,60,0.06)';

    const start = performance.now();
    const draw = () => {
      if (!running) return;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const t = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, w, h);

      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].t += 1/60;
        ripples[i].life = Math.max(0, 1 - ripples[i].t / 2.4);
        if (ripples[i].life <= 0) ripples.splice(i, 1);
      }

      const lanes = 38;
      for (let i = 0; i < lanes; i++) {
        const y = (h * (i + 0.5)) / lanes;
        ctx.beginPath(); ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 6) {
          let wave = Math.sin((x*0.012) + t*0.7 + i*0.18) * 6
                   + Math.sin((x*0.004) - t*0.5 + i*0.1) * 10;
          if (mouse.active) {
            const dx = x - mouse.x, dy = y - mouse.y;
            const d = Math.hypot(dx, dy), reach = 180;
            if (d < reach) { const f = 1 - d/reach; wave += -dy * f * f * 0.35; }
          }
          for (const rp of ripples) {
            const dx = x - rp.x, dy = y - rp.y;
            const d = Math.hypot(dx, dy);
            const radius = rp.t * 240;
            const band = Math.exp(-Math.pow((d - radius) * 0.022, 2)) * 34 * rp.amp;
            wave += band * rp.life * Math.sign(y - rp.y || 1);
          }
          ctx.lineTo(x, y + wave);
        }
        const hot = mouse.active && Math.abs(y - mouse.y) < 24;
        ctx.strokeStyle = i % 7 === 0 ? (hot ? accentHot : accent) : line;
        ctx.lineWidth = i % 7 === 0 ? (hot ? 1.4 : 1) : 0.6;
        ctx.stroke();
      }

      if (mouse.active) {
        const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
        grd.addColorStop(0, accentHot); grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd; ctx.globalAlpha = 0.18;
        ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      running = false; cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('touchend', onLeave);
    };
  }, [theme]);

  return <canvas ref={canvasRef} />;
});

window.FluidHero = FluidHero;
window.AquaRibbon = AquaRibbon;

// ─────────────────────────────────────────────
//  FluidSphere — actual 3D sphere with shader surface
//  Used by the medallion home variant
// ─────────────────────────────────────────────

const FluidSphere = ({ theme, intensity = 0.5, accentBoost = 0.4 }) => {
  const containerRef = React.useRef(null);
  const targetRot = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof THREE === 'undefined') return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { return; }
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 3.6);

    const themeColors = {
      light: {
        a: new THREE.Color(0xeef1f6),
        b: new THREE.Color(0xb6c4dc),
        c: new THREE.Color(0x6f8aaf),
        accent: new THREE.Color(0x254a8a),
      },
      dark: {
        a: new THREE.Color(0x0c1124),
        b: new THREE.Color(0x14213d),
        c: new THREE.Color(0x1f3a6d),
        accent: new THREE.Color(0x6da3ff),
      },
    };

    const uniforms = {
      u_time:     { value: 0 },
      u_a:        { value: themeColors[theme].a },
      u_b:        { value: themeColors[theme].b },
      u_c:        { value: themeColors[theme].c },
      u_accent:   { value: themeColors[theme].accent },
      u_dark:     { value: theme === 'dark' ? 1 : 0 },
      u_intensity:{ value: intensity },
      u_accentBoost:{ value: accentBoost },
    };

    const vert = /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vPos;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vPos = position;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `;

    const frag = /* glsl */ `
      precision highp float;
      varying vec3 vNormal; varying vec3 vView; varying vec3 vPos; varying vec2 vUv;
      uniform float u_time;
      uniform vec3 u_a, u_b, u_c, u_accent;
      uniform float u_dark, u_intensity, u_accentBoost;

      vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
      vec2 mod289(vec2 x){ return x - floor(x*(1.0/289.0))*289.0; }
      vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
        vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g; g.x = a0.x*x0.x + h.x*x0.y;
        g.yz = a0.yz*x12.xz + h.yz*x12.yw;
        return 130.0 * dot(m, g);
      }
      float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        for(int i=0;i<5;i++) { v += a*snoise(p); p *= 2.02; a *= 0.5; }
        return v;
      }

      void main() {
        float t = u_time * 0.10;
        // sample noise across the sphere using object-space position
        vec2 p = vec2(vPos.x, vPos.y) * 1.6 + vec2(vPos.z * 0.6, 0.0);
        vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, t*1.2)));
        vec2 r = vec2(fbm(p*1.6 + 1.7*q + t*0.3), fbm(p*1.6 + 1.7*q + vec2(8.3, 2.8) + t*0.25));
        float f = fbm(p + r);

        // base gradient based on noise
        float g = smoothstep(-0.2, 0.6, f);
        vec3 col = mix(u_a, u_b, g);
        col = mix(col, u_c, smoothstep(0.4, 1.0, g + length(r) * 0.18));

        // caustics
        float caustic = pow(abs(sin(f * 5.0 + u_time * 0.55)), 16.0);
        vec3 highlight = mix(vec3(1.0, 0.96, 0.92), u_accent, 0.20);
        float causticStrength = mix(0.10, 0.32, u_dark);
        col += caustic * highlight * causticStrength * u_intensity * u_accentBoost;

        // soft directional shading
        vec3 lightDir = normalize(vec3(0.4, 0.6, 0.8));
        float lambert = max(dot(vNormal, lightDir), 0.0);
        col *= mix(0.55, 1.05, lambert);

        // fresnel rim — accent kiss along the silhouette
        float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.6);
        col = mix(col, u_accent, fres * 0.45 * u_accentBoost);

        // gentle vignette in screen space (UV based)
        float vig = 1.0 - smoothstep(0.4, 0.72, length(vUv - 0.5));
        col *= mix(0.88, 1.0, vig);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const geom = new THREE.SphereGeometry(1, 96, 96);
    const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms });
    const sphere = new THREE.Mesh(geom, mat);
    scene.add(sphere);

    // ambient halo behind sphere
    const haloGeom = new THREE.PlaneGeometry(3.4, 3.4);
    const haloMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { u_accent: { value: themeColors[theme].accent }, u_dark: { value: theme === 'dark' ? 1 : 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);}',
      fragmentShader: `precision highp float; varying vec2 vUv; uniform vec3 u_accent; uniform float u_dark;
        void main(){
          float d = length(vUv - 0.5) * 2.0;
          float a = exp(-pow(d * 1.4, 2.0));
          gl_FragColor = vec4(u_accent, a * mix(0.10, 0.22, u_dark));
        }`,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.position.z = -0.5;
    scene.add(halo);

    // resize ----
    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);
    onResize();

    // mouse parallax ----
    const onMouse = (e) => {
      const r = container.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      targetRot.current.x = -y * 0.45;
      targetRot.current.y =  x * 0.55;
    };
    window.addEventListener('mousemove', onMouse);

    // animate ----
    let raf; let running = true;
    const start = performance.now();
    let curRotX = 0, curRotY = 0;
    const tick = () => {
      if (!running) return;
      const elapsed = (performance.now() - start) / 1000;
      uniforms.u_time.value = elapsed;
      // ease toward target
      curRotX += (targetRot.current.x - curRotX) * 0.045;
      curRotY += (targetRot.current.y - curRotY) * 0.045;
      sphere.rotation.x = curRotX;
      sphere.rotation.y = curRotY + elapsed * 0.06; // slow auto-rotate
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    if (reduced) { uniforms.u_time.value = 6; renderer.render(scene, camera); }
    else { raf = requestAnimationFrame(tick); }

    return () => {
      running = false; cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouse);
      geom.dispose(); mat.dispose(); haloGeom.dispose(); haloMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [theme, intensity, accentBoost]);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />;
};

window.FluidSphere = FluidSphere;
