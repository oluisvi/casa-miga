document.querySelectorAll('.food').forEach((card) => card.addEventListener('click', () => {
  card.classList.toggle('selected');
}));

const stickyBackdrop = document.createElement("div");
stickyBackdrop.className = "sticky-backdrop";
stickyBackdrop.setAttribute("aria-hidden", "true");
document.querySelector("main").prepend(stickyBackdrop);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion) {
  const video = document.createElement("video");
  video.className = "site-background-video";
  video.src = "media/miga-story.mp4";
  video.poster = "hero-still.png";
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "auto";
  video.addEventListener("error", () => video.remove(), { once: true });
  stickyBackdrop.append(video);
  video.play().catch(() => {});
}

const sections = [...document.querySelectorAll(".fixed-copy")];
const observer = new IntersectionObserver(entries => {
  const active = entries.filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (active) stickyBackdrop.dataset.chapter = active.target.dataset.chapter;
}, { threshold: [.15, .35, .6] });
sections.forEach(section => observer.observe(section));

if (reduceMotion) {
  stickyBackdrop.style.position = "absolute";
  stickyBackdrop.style.height = "100svh";
  stickyBackdrop.style.zIndex = "0";
  stickyBackdrop.style.backgroundImage = "url('hero-still.png')";
}
