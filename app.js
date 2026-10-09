const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const primaryNav = document.querySelector('#primary-nav');
const navToggle = document.querySelector('.menu-toggle');
const bagToggle = document.querySelector('.miga-cart-toggle');
const cart = document.querySelector('#miga-cart');
const cartItems = cart.querySelector('.cart-items');
const cartCount = cart.querySelector('.cart-count');
const bagCount = bagToggle.querySelector('b');
const videoToggle = document.querySelector('.video-toggle');
const selectedItems = [];

function setCartOpen(open) {
  cart.hidden = !open;
  bagToggle.setAttribute('aria-expanded', String(open));
  if (open) cart.querySelector('.cart-close').focus();
  else bagToggle.focus();
}

bagToggle.addEventListener('click', () => setCartOpen(cart.hidden));
cart.querySelector('.cart-close').addEventListener('click', () => {
  setCartOpen(false);
  bagToggle.focus();
});
cart.querySelector('.cart-return').addEventListener('click', () => setCartOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !cart.hidden) setCartOpen(false);
});

function updateCart() {
  bagCount.textContent = String(selectedItems.length);
  cartCount.textContent = selectedItems.length
    ? `${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'itens'} na sacola demonstrativa.`
    : 'Sua seleção está vazia.';
  cartItems.replaceChildren(...selectedItems.map((name) => {
    const item = document.createElement('li');
    item.textContent = name;
    return item;
  }));
}

document.querySelectorAll('.food-add').forEach((button) => {
  const originalLabel = button.getAttribute('aria-label');
  button.addEventListener('click', () => {
    const name = button.closest('.food').querySelector('h3').textContent;
    selectedItems.push(name);
    updateCart();
    button.textContent = '✓';
    button.setAttribute('aria-pressed', 'true');
    button.setAttribute('aria-label', `${name} adicionado à sacola demonstrativa`);
    window.setTimeout(() => {
      button.textContent = '＋';
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', originalLabel);
    }, 900);
  });
});

navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Fechar navegação' : 'Abrir navegação');
  primaryNav.dataset.open = String(open);
});
primaryNav.addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Abrir navegação');
  primaryNav.dataset.open = 'false';
});

const stickyBackdrop = document.createElement('div');
stickyBackdrop.className = 'sticky-backdrop';
stickyBackdrop.setAttribute('aria-hidden', 'true');
document.querySelector('main').prepend(stickyBackdrop);

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
  backgroundVideo.addEventListener('error', () => {
    backgroundVideo.remove();
    videoToggle.hidden = true;
    stickyBackdrop.classList.add('still-frame');
  }, { once: true });
  stickyBackdrop.append(backgroundVideo);
  backgroundVideo.play().catch(() => {});
} else {
  stickyBackdrop.classList.add('still-frame');
  videoToggle.hidden = true;
}

videoToggle.addEventListener('click', (event) => {
  if (!backgroundVideo) return;
  const paused = !backgroundVideo.paused;
  if (paused) backgroundVideo.pause();
  else backgroundVideo.play().catch(() => {});
  event.currentTarget.textContent = paused ? 'Retomar vídeo' : 'Pausar vídeo';
  event.currentTarget.setAttribute('aria-pressed', String(paused));
});

function thematicEntry(video, phrase, mark) {
  const storageKey = 'casa-miga:thematic-entry-seen:v3';
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
    window.setTimeout(() => {
      entry.classList.add('is-gone');
      window.setTimeout(() => entry.remove(), 240);
    }, 1080);
  };
  const openWhenReady = () => window.setTimeout(open, 260);
  const fallback = window.setTimeout(open, 7000);
  if (!video || video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) openWhenReady();
  else {
    video.addEventListener('loadeddata', openWhenReady, { once: true });
    video.addEventListener('error', openWhenReady, { once: true });
  }
}

thematicEntry(backgroundVideo, 'A manhã começa quando o café é servido.', '✳');

function initProductCarousel(root) {
  const track = root.querySelector('[data-product-track]');
  const slides = [...root.querySelectorAll('[data-product-slide]')];
  const previous = root.querySelector('[data-product-prev]');
  const next = root.querySelector('[data-product-next]');
  const counter = root.querySelector('[data-product-counter]');
  const progress = root.querySelector('[data-product-progress]');
  let activeIndex = 0;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragging = false;
  let dragged = false;
  let scrollFrame = 0;

  const update = () => {
    scrollFrame = 0;
    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + track.clientLeft + track.clientWidth / 2;
    const closest = slides.reduce((best, slide, index) => {
      const rect = slide.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - trackCenter);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Infinity });
    activeIndex = closest.index;
    counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} — ${String(slides.length).padStart(2, '0')}`;
    progress.style.transform = `scaleX(${(activeIndex + 1) / slides.length})`;
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex >= slides.length - 1;
  };

  const queueUpdate = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(update);
  };

  const step = (direction) => {
    const slide = slides[Math.max(0, Math.min(slides.length - 1, activeIndex + direction))];
    const trackRect = track.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    const target = track.scrollLeft + slideRect.left - trackRect.left - track.clientLeft
      - (track.clientWidth - slideRect.width) / 2;
    track.scrollTo({ left: Math.max(0, target), behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  track.addEventListener('scroll', queueUpdate, { passive: true });
  track.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    step(event.key === 'ArrowRight' ? 1 : -1);
  });
  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button')) return;
    dragging = true;
    dragged = false;
    dragStartX = event.clientX;
    dragStartScroll = track.scrollLeft;
    track.classList.add('is-dragging');
    track.setPointerCapture(event.pointerId);
  });
  track.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const delta = event.clientX - dragStartX;
    if (Math.abs(delta) > 5) dragged = true;
    if (dragged) track.scrollLeft = dragStartScroll - delta;
  });
  const finishDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
  };
  track.addEventListener('pointerup', finishDrag);
  track.addEventListener('pointercancel', finishDrag);
  track.addEventListener('click', (event) => {
    if (!dragged) return;
    event.preventDefault();
    event.stopPropagation();
    dragged = false;
  }, true);
  window.addEventListener('resize', queueUpdate, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(queueUpdate).observe(track);
  update();
}

document.querySelectorAll('[data-product-carousel]').forEach(initProductCarousel);

const revealTargets = document.querySelectorAll('.manifesto, .story-copy, .postcard > *, .case-note > *, .visit > *, footer, [data-reveal]');
if (!reduceMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-enhanced');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealTargets.forEach((target) => revealObserver.observe(target));
} else revealTargets.forEach((target) => target.classList.add('is-visible'));

const sections = [...document.querySelectorAll('.fixed-copy[data-chapter]')];
if ('IntersectionObserver' in window) {
  const chapterObserver = new IntersectionObserver((entries) => {
    const active = entries.filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (active) stickyBackdrop.dataset.chapter = active.target.dataset.chapter;
  }, { threshold: [0.15, 0.35, 0.6] });
  sections.forEach((section) => chapterObserver.observe(section));
}
