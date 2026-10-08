const navToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Fechar navegação' : 'Abrir navegação');
  primaryNav.dataset.open = String(open);
});
primaryNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir navegação');
    primaryNav.dataset.open = 'false';
  }
});

const stickyBackdrop = document.createElement('div');
stickyBackdrop.className = 'sticky-backdrop';
stickyBackdrop.setAttribute('aria-hidden', 'true');
document.querySelector('main').prepend(stickyBackdrop);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let backgroundVideo;
if (!reduceMotion) {
  backgroundVideo = document.createElement('video');
  backgroundVideo.className = 'site-background-video';
  backgroundVideo.src = 'media/miga-story.mp4';
  backgroundVideo.poster = 'hero-still.png';
  backgroundVideo.autoplay = true;
  backgroundVideo.muted = true;
  backgroundVideo.loop = true;
  backgroundVideo.playsInline = true;
  backgroundVideo.preload = 'metadata';
  backgroundVideo.addEventListener('error', () => backgroundVideo.remove(), { once: true });
  stickyBackdrop.append(backgroundVideo);
  backgroundVideo.play().catch(() => {});
} else {
  stickyBackdrop.classList.add('still-frame');
}

document.querySelector('.video-toggle').addEventListener('click', (event) => {
  if (!backgroundVideo) return;
  const paused = !backgroundVideo.paused;
  if (paused) backgroundVideo.pause();
  else backgroundVideo.play().catch(() => {});
  event.currentTarget.textContent = paused ? 'Retomar vídeo' : 'Pausar vídeo';
  event.currentTarget.setAttribute('aria-pressed', String(paused));
});

function thematicEntry(video, phrase, mark) {
  const storageKey = 'casa-miga:thematic-entry-seen:v2';
  let alreadySeen = false;
  try { alreadySeen = sessionStorage.getItem(storageKey) === '1'; } catch {}
  if (alreadySeen || reduceMotion) return;

  const entry = document.createElement('div');
  entry.className = 'thematic-entry thematic-entry-bakery';
  entry.dataset.state = 'waiting';
  entry.setAttribute('aria-hidden', 'true');
  entry.innerHTML = `<div class="entry-panel entry-panel-a"></div><div class="entry-panel entry-panel-b"></div><span class="entry-mark">${mark}</span><span class="entry-phrase">${phrase}</span>`;
  document.body.append(entry);

  let opened = false;
  const open = () => {
    if (opened) return;
    opened = true;
    clearTimeout(fallback);
    try { sessionStorage.setItem(storageKey, '1'); } catch {}
    entry.dataset.state = 'opening';
    window.setTimeout(() => entry.remove(), 1450);
  };
  const fallback = window.setTimeout(open, 7000);
  const ready = () => window.setTimeout(open, 260);

  if (!video || video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) ready();
  else {
    video.addEventListener('loadeddata', ready, { once: true });
    video.addEventListener('error', ready, { once: true });
  }
}

thematicEntry(backgroundVideo, 'A manhã começa quando o café é servido.', '✳');

const sections = [...document.querySelectorAll('.fixed-copy')];
const observer = new IntersectionObserver((entries) => {
  const active = entries.filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (active) stickyBackdrop.dataset.chapter = active.target.dataset.chapter;
}, { threshold: [0.15, 0.35, 0.6] });
sections.forEach((section) => observer.observe(section));
