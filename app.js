const $ = id => document.getElementById(id);

const album = $('album');
const lightbox = $('lightbox');
const big = $('lbImg');
const caption = $('lbCaption');
const drift = $('drift');

const photos = PHOTOS;
let current = 0;

const when = photo => photo.date && new Date(photo.date).toLocaleString('it-IT', {
  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

function show(i) {
  current = (i + photos.length) % photos.length;
  big.src = photos[current].src;
  caption.textContent = [when(photos[current]), `${current + 1} / ${photos.length}`].filter(Boolean).join(' · ');
  lightbox.hidden = false;
}

const hide = () => void (lightbox.hidden = true);

$('count').textContent = `${photos.length} foto`;
album.innerHTML = photos.map((photo, i) => `
  <button class="photo" onclick="show(${i})">
    <img src="${photo.src}" loading="lazy">
    ${photo.date ? `<span class="date">${when(photo)}</span>` : ''}
  </button>`).join('');

$('lbClose').onclick = hide;
$('lbPrev').onclick = e => (e.stopPropagation(), show(current - 1));
$('lbNext').onclick = e => (e.stopPropagation(), show(current + 1));
lightbox.onclick = e => e.target === lightbox && hide();

document.onkeydown = e => lightbox.hidden || ({
  Escape: hide,
  ArrowLeft: () => show(current - 1),
  ArrowRight: () => show(current + 1),
})[e.key]?.();

const watcher = new IntersectionObserver(seen => seen.forEach(s => s.target.classList.toggle('seen', s.isIntersecting)));

drift.innerHTML = DECOR.map((src, i) => `
  <img src="${src}" style="
    top: ${6 + i * 90 / DECOR.length}%;
    ${i & 1 ? 'right' : 'left'}: ${i % 4}%;
    rotate: ${i & 1 ? 6 : -6}deg">`).join('');
[...drift.children].forEach(img => watcher.observe(img));

addEventListener('scroll', () => {
  for (const img of drift.children) img.style.translate = `0 ${(img.offsetTop - scrollY) * -0.08}px`;
});
