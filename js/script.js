/* ============================================================
   AgroPhotonics — Interactive Presentation
   ============================================================ */

(function() {
  'use strict';

  /* -------- Scroll progress bar -------- */
  const progress = document.getElementById('scrollProgress');
  function updateProgress() {
    const h = document.documentElement;
    const scrolled = h.scrollTop || document.body.scrollTop;
    const total = h.scrollHeight - h.clientHeight;
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    progress.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* -------- Nav dots active state -------- */
  const dots = document.querySelectorAll('.nav-dots a');
  const sections = document.querySelectorAll('.section');

  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        dots.forEach(d => d.classList.toggle('active', d.getAttribute('href') === '#' + id));
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => activeObserver.observe(s));

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(dot.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* -------- Reveal on scroll -------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* -------- Number count-up on view -------- */
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.getAttribute('data-count');
      const target = parseFloat(raw);
      if (isNaN(target)) return;

      const original = el.textContent.trim();
      const prefix = original.match(/^\D*/)[0] || '';
      const suffix = original.match(/\D*$/)[0] || '';
      const isFloat = original.includes('.');

      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = target * eased;
        el.textContent = prefix + (isFloat ? val.toFixed(3) : Math.round(val)) + suffix;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = original;
      }
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

  /* -------- Build spectrum bars (18 channels) -------- */
  const wavelengths = [
    { nm: 410, color: '#8B00FF', role: 'Ranglar (violet)' },
    { nm: 435, color: '#4B0082', role: 'Pigment maʼlumoti' },
    { nm: 460, color: '#0000FF', role: 'Xlorofil signali' },
    { nm: 485, color: '#0080FF', role: 'Pishish rangi' },
    { nm: 510, color: '#00BFFF', role: 'Sirt aksi' },
    { nm: 535, color: '#00FF7F', role: 'Xlorofil koʻrinishi' },
    { nm: 560, color: '#00FF00', role: 'Yashil dominant' },
    { nm: 585, color: '#ADFF2F', role: 'Karotinoid' },
    { nm: 610, color: '#FFA500', role: 'Struktura signali' },
    { nm: 645, color: '#FF7F00', role: 'Ichki rang' },
    { nm: 680, color: '#FF4500', role: 'Xlorofil-a maksimumi' },
    { nm: 705, color: '#FF0000', role: 'Red-edge zonasi' },
    { nm: 730, color: '#C71585', role: 'NIR chegarasi' },
    { nm: 760, color: '#8B0000', role: 'Suv absorbsiyasi' },
    { nm: 810, color: '#7F1D1D', role: 'Umumiy NIR' },
    { nm: 860, color: '#63171B', role: 'Suvli javob' },
    { nm: 900, color: '#4A1214', role: 'Ichki tuzilma' },
    { nm: 940, color: '#310A0C', role: 'Suv miqdori javobi' }
  ];

  const bars = document.getElementById('spectrumBars');
  if (bars) {
    wavelengths.forEach((w, i) => {
      const bar = document.createElement('div');
      bar.className = 'spectrum-bar';
      bar.style.background = `linear-gradient(180deg, ${w.color} 0%, ${w.color}88 100%)`;
      bar.setAttribute('data-nm', w.nm);
      bar.innerHTML = `
        <span class="nm-label">${w.nm}nm</span>
        <span class="spectrum-tooltip"><b>${w.nm} nm</b><br/>${w.role}<br/><small style="opacity:.7">AI umumiy modelga hissa</small></span>
      `;
      bars.appendChild(bar);
    });

    // Animate heights when visible
    const spectrumObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const barEls = entry.target.querySelectorAll('.spectrum-bar');
          barEls.forEach((b, i) => {
            const h = 25 + Math.abs(Math.sin(i * 0.55 + 1) * 60) + Math.random() * 15;
            setTimeout(() => { b.style.height = h + '%'; }, i * 60);
          });
          spectrumObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    spectrumObserver.observe(bars);
  }

  /* -------- Pipeline node cycler (Page 3) -------- */
  const pipelineNodes = document.querySelectorAll('.pipeline .pipeline-node');
  if (pipelineNodes.length > 0) {
    let currentActive = 0;
    let pipelineTimer = null;

    function cyclePipeline() {
      pipelineNodes.forEach(n => n.classList.remove('active'));
      pipelineNodes[currentActive].classList.add('active');
      currentActive = (currentActive + 1) % pipelineNodes.length;
    }

    const pipelineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !pipelineTimer) {
          cyclePipeline();
          pipelineTimer = setInterval(cyclePipeline, 1800);
        } else if (!entry.isIntersecting && pipelineTimer) {
          clearInterval(pipelineTimer);
          pipelineTimer = null;
        }
      });
    }, { threshold: 0.2 });
    pipelineObserver.observe(pipelineNodes[0].parentElement);
  }

  /* -------- AI pipeline hot-node cycler (Page 5) -------- */
  const aiNodes = document.querySelectorAll('.ai-pipeline .ai-node');
  if (aiNodes.length > 0) {
    let aiIdx = 0;
    let aiTimer = null;

    function cycleAI() {
      aiNodes.forEach(n => n.classList.remove('hot'));
      aiNodes[aiIdx].classList.add('hot');
      aiIdx = (aiIdx + 1) % aiNodes.length;
    }

    const aiObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !aiTimer) {
          cycleAI();
          aiTimer = setInterval(cycleAI, 1200);
        } else if (!entry.isIntersecting && aiTimer) {
          clearInterval(aiTimer);
          aiTimer = null;
        }
      });
    }, { threshold: 0.2 });
    aiObserver.observe(aiNodes[0].parentElement);
  }

  /* -------- Accuracy bars animate on view (Page 5) -------- */
  const accObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bars = entry.target.querySelectorAll('.acc-bar');
      bars.forEach((b, i) => {
        const h = b.getAttribute('data-h');
        setTimeout(() => { b.style.height = h + '%'; }, i * 220);
      });
      accObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.acc-viz').forEach(el => accObserver.observe(el));

  /* -------- AI particles (Page 5) -------- */
  const aiParticles = document.getElementById('aiParticles');
  if (aiParticles) {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'ai-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = (Math.random() * 8) + 's';
      p.style.animationDuration = (6 + Math.random() * 6) + 's';
      p.style.opacity = 0.3 + Math.random() * 0.5;
      aiParticles.appendChild(p);
    }
  }

  /* -------- Hero device tilt on pointer move -------- */
  const deviceStage = document.getElementById('deviceStage');
  const device = document.querySelector('.hero-device');
  if (deviceStage && device) {
    deviceStage.addEventListener('pointermove', (e) => {
      const rect = deviceStage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      device.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
      device.style.transition = 'transform 0.15s ease-out';
    });
    deviceStage.addEventListener('pointerleave', () => {
      device.style.transform = '';
      device.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  }

  /* -------- Keyboard navigation ← → -------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      const cur = document.querySelector('.nav-dots a.active');
      const next = cur && cur.nextElementSibling;
      if (next) { e.preventDefault(); document.querySelector(next.getAttribute('href')).scrollIntoView({behavior:'smooth'}); }
    }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      const cur = document.querySelector('.nav-dots a.active');
      const prev = cur && cur.previousElementSibling;
      if (prev) { e.preventDefault(); document.querySelector(prev.getAttribute('href')).scrollIntoView({behavior:'smooth'}); }
    }
  });

})();
