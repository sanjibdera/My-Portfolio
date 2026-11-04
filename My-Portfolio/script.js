// Theme toggle, mobile menu and scroll reveal live inline in index.html so they work even if this file fails to load.

// ============================================
// Active nav link (scroll-spy + click)
// ============================================
document.documentElement.classList.add('spy-js'); // hand the nav highlight over from the CSS fallback to JS
const sections = [...document.querySelectorAll('main .section')];
const navLinks = document.querySelectorAll('[data-nav]');
let navLock = false, lockT;

function setActive(id) {
  navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
}
function spy() {
  if (navLock) return;
  let cur = sections[0].id;
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = sections[sections.length - 1].id;
  else sections.forEach(s => { if (s.getBoundingClientRect().top <= 140) cur = s.id; });
  setActive(cur);
}
function unlock() { navLock = false; spy(); }
navLinks.forEach(l => l.addEventListener('click', () => {
  navLock = true; setActive(l.getAttribute('href').slice(1));
  clearTimeout(lockT); lockT = setTimeout(unlock, 900);
}));
let spyTick = false;
addEventListener('scroll', () => {
  if (navLock) { clearTimeout(lockT); lockT = setTimeout(unlock, 150); return; }
  if (!spyTick) { spyTick = true; requestAnimationFrame(() => { spy(); spyTick = false; }); }
}, { passive: true });
spy();

// ============================================
// Typing role effect
// ============================================
const roles = ['MCA Student', 'MERN Stack Developer', 'Full-Stack Web Developer', 'Aspiring Software Engineer'];
const typedEl = document.getElementById('typedRole');
let roleIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  const current = roles[roleIndex];

  if (!deleting) {
    charIndex++;
    typedEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1400);
      return;
    }
  } else {
    charIndex--;
    typedEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }

  setTimeout(typeLoop, deleting ? 40 : 75);
}

typeLoop();

// ============================================
// Contact form — sends real emails via Web3Forms
// ============================================
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const accessKey = form.access_key.value;
  if (!accessKey) {
    formNote.textContent = '$ error: add your Web3Forms access key in index.html first.';
    formNote.style.color = 'var(--danger)';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  formNote.style.color = 'var(--accent)';
  formNote.textContent = '$ sending message...';

  try {
    const formData = new FormData(form);
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    });
    const result = await response.json();

    if (result.success) {
      formNote.textContent = '$ message sent — thanks! I\'ll get back to you soon.';
      form.reset();
    } else {
      formNote.textContent = '$ error: ' + (result.message || 'something went wrong, try again.');
      formNote.style.color = 'var(--danger)';
    }
  } catch (err) {
    formNote.textContent = '$ error: network issue — please try again in a moment.';
    formNote.style.color = 'var(--danger)';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});

// ============================================
// Unified interactive background (canvas) + static decor
// ============================================
(function () {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.getElementById('bgCanvas'), cx = cv.getContext('2d');
  const tok = ['{ }', '=>', '01', '</>', 'fn()', '[ ]', 'AI', '&&', '∇', 'Σ', 'λ', 'π', 'ŷ', 'O(n)', 'θ', '∂', 'ReLU', '0x1F', 'if()', 'e'];
  let W, H, N = [], G = [], PK = [], mx = -9999, my = -9999, sy = scrollY, rgb = null, run = true;
  const D = 130;
  const col = () => rgb || (rgb = getComputedStyle(document.body).getPropertyValue('--node').trim());
  const wrap = (v, m) => ((v % m) + m) % m;

  function size() {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.max(26, Math.min(80, Math.round(W * H / 20000)));
    N = []; G = [];
    for (let i = 0; i < n; i++) N.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, z: .3 + Math.random() * .7 });
    for (let i = 0; i < 22; i++) G.push({ x: Math.random() * W, y: Math.random() * H, z: .15 + Math.random() * .3, t: tok[i % tok.length] });
    if (RM) frame();
  }

  function frame() {
    const c = col(), P = [];
    cx.clearRect(0, 0, W, H);
    const ox = mx > -9000 ? mx - W / 2 : 0, oy = my > -9000 ? my - H / 2 : 0;
    cx.font = '13px JetBrains Mono, monospace';
    for (const g of G) { cx.fillStyle = `rgba(${c},${(.1 + g.z * .3).toFixed(2)})`; cx.fillText(g.t, wrap(g.x - ox * .01 * g.z, W), wrap(g.y - sy * g.z * .3, H)); }
    for (const a of N) {
      if (!RM) { a.x = wrap(a.x + a.vx, W); a.y = wrap(a.y + a.vy, H); }
      let px = a.x - ox * .03 * a.z, py = wrap(a.y - sy * a.z * .25 - oy * .03 * a.z, H);
      const dx = px - mx, dy = py - my, d2 = dx * dx + dy * dy;
      if (d2 < 18000 && d2 > 1) { const f = (1 - d2 / 18000) * 14, d = Math.sqrt(d2); px += dx / d * f; py += dy / d * f; }
      P.push([px, py, a.z]);
    }
    for (let i = 0; i < P.length; i++) {
      const a = P[i];
      for (let j = i + 1; j < P.length; j++) {
        const b = P[j], x = a[0] - b[0], y = a[1] - b[1], q = x * x + y * y;
        if (q < D * D) {
          cx.strokeStyle = `rgba(${c},${((1 - Math.sqrt(q) / D) * .22 * Math.min(a[2], b[2]) + .02).toFixed(3)})`;
          cx.lineWidth = .8; cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke();
        }
      }
      const m = a[0] - mx, n = a[1] - my, mq = m * m + n * n;
      if (mq < 22500) { cx.strokeStyle = `rgba(${c},${((1 - mq / 22500) * .3).toFixed(3)})`; cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(mx, my); cx.stroke(); }
      cx.fillStyle = `rgba(${c},${(.25 + a[2] * .4).toFixed(2)})`; cx.beginPath(); cx.arc(a[0], a[1], 1 + a[2] * 1.4, 0, 6.283); cx.fill();
    }
    if (!RM) {
      if (PK.length < 5 && Math.random() < .03) PK.push({ a: Math.random() * P.length | 0, b: Math.random() * P.length | 0, t: 0 });
      for (let i = PK.length - 1; i >= 0; i--) {
        const k = PK[i], A = P[k.a], B = P[k.b]; k.t += .015;
        if (!A || !B || k.t >= 1 || Math.hypot(A[0] - B[0], A[1] - B[1]) > D) { PK.splice(i, 1); continue; }
        cx.fillStyle = `rgba(${c},.8)`; cx.beginPath(); cx.arc(A[0] + (B[0] - A[0]) * k.t, A[1] + (B[1] - A[1]) * k.t, 2, 0, 6.283); cx.fill();
      }
    }
  }
  const loop = () => { if (run) frame(); requestAnimationFrame(loop); };
  addEventListener('resize', size);
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  addEventListener('pointerleave', () => { mx = my = -9999; });
  addEventListener('scroll', () => { sy = scrollY; if (RM) frame(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { run = !document.hidden; });
  new MutationObserver(() => { rgb = null; if (RM) frame(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  size(); if (!RM) loop();

  // ---- static decorative layer (formulas, code, mini diagrams) ----
  const deco = document.getElementById('deco');
  const T = [
    [3, 16, 'σ(x) = 1 / (1 + e⁻ˣ)', 15, -4], [70, 5, '∇θ L(θ) = ∂L/∂θ', 16, 3],
    [8, 26, 'softmax(zᵢ) = eᶻⁱ / Σ eᶻʲ', 14, 0, 'lg'], [74, 18, 'O(n log n)', 15, -3],
    [60, 29, 'for epoch in range(100):\n    loss = model.fit(X, y)\n    optimizer.step()', 13, 0],
    [4, 34, 'π ≈ 3.14159   e ≈ 2.71828   φ ≈ 1.618', 13, 0, 'lg'],
    [5, 48, 'const res = await fetch(url);\nconst data = await res.json();', 13, 0],
    [72, 45, 'git commit -m "feat: add ai"\ngit push origin main', 13, 0],
    [8, 62, 'class Node:\n    def __init__(self, val):\n        self.next = None', 13, 0, 'lg'],
    [66, 60, 'W·x + b → ReLU → ŷ', 15, -2],
    [5, 76, 'while (lo <= hi) {\n  mid = (lo + hi) >> 1;\n}', 13, 0],
    [66, 75, '{ "model": "gemini", "temp": 0.7 }', 13, 0, 'lg'],
    [14, 91, '∑ᵢ (yᵢ − ŷᵢ)² / n', 15, 2], [62, 90, '0110 1001 1100 0101', 14, 0],
  ];
  T.forEach(([x, y, t, fs, r, c]) => {
    const s = document.createElement('span'); s.textContent = t;
    s.style.cssText = `left:${x}%;top:${y}%;font-size:${fs}px;transform:rotate(${r}deg)`;
    if (c) s.className = c; deco.appendChild(s);
  });
  const svg = (w, vb, body) => `<svg viewBox="${vb}" width="${w}" fill="none" stroke="currentColor" stroke-width="1.2">${body}</svg>`;
  const nn = w => {
    const ly = [[18, 45, 72], [10, 32, 58, 80], [28, 62]], lx = [14, 60, 106]; let b = '';
    for (let l = 0; l < 2; l++) ly[l].forEach(a => ly[l + 1].forEach(c => b += `<line x1="${lx[l]}" y1="${a}" x2="${lx[l + 1]}" y2="${c}" stroke-opacity=".55"/>`));
    ly.forEach((L, i) => L.forEach(y => b += `<circle cx="${lx[i]}" cy="${y}" r="4.5" fill="currentColor"/>`));
    return svg(w, '0 0 120 90', b);
  };
  const pts = [[60, 10], [30, 40], [90, 40], [15, 72], [45, 72], [75, 72], [105, 72]];
  const tree = w => svg(w, '0 0 120 84', [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]].map(([a, b]) => `<line x1="${pts[a][0]}" y1="${pts[a][1]}" x2="${pts[b][0]}" y2="${pts[b][1]}" stroke-opacity=".55"/>`).join('') + pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="currentColor"/>`).join(''));
  const gp = [[15, 60], [45, 20], [85, 35], [105, 75], [60, 80]];
  const graph = w => svg(w, '0 0 120 90', [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 4], [2, 4]].map(([a, b]) => `<line x1="${gp[a][0]}" y1="${gp[a][1]}" x2="${gp[b][0]}" y2="${gp[b][1]}" stroke-opacity=".55"/>`).join('') + gp.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="currentColor"/>`).join(''));
  [[78, 11, nn, 150], [3, 41, tree, 130], [80, 55, graph, 130], [6, 69, nn, 110, 'lg']].forEach(([x, y, f, w, c]) => {
    const h = document.createElement('div'); h.innerHTML = f(w); const e = h.firstChild;
    e.style.left = x + '%'; e.style.top = y + '%'; if (c) e.setAttribute('class', c); deco.appendChild(e);
  });
})();

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
