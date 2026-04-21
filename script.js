/* ===== Typewriter (declared first — used by applyLang) ===== */
const phrases = {
  en: ['Factory Management', 'Process Engineering', 'R&D Leadership', 'Quality & Compliance', 'Chemical Formulation'],
  ar: ['إدارة المصانع', 'هندسة العمليات', 'قيادة البحث والتطوير', 'الجودة والامتثال', 'التركيب الكيميائي'],
};
const tw = document.getElementById('typewriter');
let twState = { i: 0, j: 0, deleting: false, timer: null };
let currentLang = localStorage.getItem('lang') || 'en';

function typeStep() {
  const list = phrases[currentLang];
  const word = list[twState.i];
  if (!twState.deleting) {
    tw.textContent = word.slice(0, ++twState.j);
    if (twState.j === word.length) {
      twState.deleting = true;
      twState.timer = setTimeout(typeStep, 1800);
      return;
    }
  } else {
    tw.textContent = word.slice(0, --twState.j);
    if (twState.j === 0) {
      twState.deleting = false;
      twState.i = (twState.i + 1) % list.length;
    }
  }
  twState.timer = setTimeout(typeStep, twState.deleting ? 30 : 55);
}

function resetTypewriter() {
  clearTimeout(twState.timer);
  twState = { i: 0, j: 0, deleting: false, timer: null };
  tw.textContent = '';
  setTimeout(typeStep, 400);
}

/* ===== Theme Toggle ===== */
const themeBtn = document.getElementById('themeBtn');
const html = document.documentElement;

function setTheme(t) {
  html.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  themeBtn.innerHTML = t === 'dark'
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

(function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (prefersDark ? 'dark' : 'light'));
})();

themeBtn.addEventListener('click', () => {
  setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ===== Language Toggle ===== */
const langBtn = document.getElementById('langBtn');

function applyLang(lang) {
  currentLang = lang;
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  localStorage.setItem('lang', lang);
  langBtn.querySelector('span').textContent = lang === 'en' ? 'AR' : 'EN';
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = lang === 'ar' ? (el.dataset.ar || el.dataset.en) : el.dataset.en;
  });
  resetTypewriter();
}

langBtn.addEventListener('click', () => applyLang(currentLang === 'en' ? 'ar' : 'en'));
applyLang(currentLang);

/* ===== Mobile Menu ===== */
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  menuBtn.innerHTML = navLinks.classList.contains('open')
    ? '<i class="fa-solid fa-xmark"></i>'
    : '<i class="fa-solid fa-bars"></i>';
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
  });
});

/* ===== Scroll: progress + navbar + active nav + back-to-top ===== */
const scrollProgress = document.getElementById('scrollProgress');
const navbar = document.getElementById('navbar');
const toTop = document.getElementById('toTop');
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;

  // Progress bar
  scrollProgress.style.width = (scrolled / maxScroll * 100) + '%';

  // Navbar shadow
  navbar.classList.toggle('scrolled', scrolled > 20);

  // Back-to-top
  toTop.classList.toggle('visible', scrolled > 400);

  // Active nav link
  let current = '';
  sections.forEach(sec => {
    if (scrolled >= sec.offsetTop - 120) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}, { passive: true });

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== Reveal on Scroll (IntersectionObserver) ===== */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      // Stagger children in same parent
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
      const delay = siblings.indexOf(entry.target) * 80;
      setTimeout(() => entry.target.classList.add('in'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ===== Stat Counter ===== */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateStat(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const target = parseInt(el.dataset.target, 10);
  const duration = 1400 + Math.log10(target + 1) * 350;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.round(easeInOutCubic(progress) * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num[data-target]').forEach(animateStat);
    }
  });
}, { threshold: 0.5 });

const heroSection = document.getElementById('hero');
if (heroSection) statObserver.observe(heroSection);

/* ===== Skill bars animate on scroll ===== */
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(bar => {
        const pct = bar.style.getPropertyValue('--pct').trim();
        if (pct) bar.style.width = pct;
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.skill-category').forEach(el => skillObserver.observe(el));

/* ===== Project Tabs ===== */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    const container = btn.closest('section');

    container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    container.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const target = document.getElementById('tab-' + tabId);
    if (target) {
      target.classList.add('active');
      // Re-trigger reveal for newly visible cards
      target.querySelectorAll('.reveal:not(.in)').forEach(el => {
        setTimeout(() => el.classList.add('in'), 50);
      });
    }
  });
});

/* ===== Smooth anchor scroll (offset for fixed navbar) ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(html).getPropertyValue('--nav-h')) || 70) - 10;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
