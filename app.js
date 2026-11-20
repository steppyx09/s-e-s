const album = document.getElementById('album');
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCaption = document.getElementById('lbCaption');

const foto = FOTO;
let n = 0;

function data(f) {
  if (!f.date) return '';
  return new Date(f.date).toLocaleString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function apri(i) {
  n = (i + foto.length) % foto.length;
  lbImg.src = foto[n].src;
  lbCaption.textContent = [data(foto[n]), `${n + 1} / ${foto.length}`].filter(Boolean).join(' · ');
  lightbox.hidden = false;
}

function chiudi() {
  lightbox.hidden = true;
}

document.getElementById('count').textContent = foto.length + ' foto';
album.innerHTML = foto.map((f, i) => `
  <button class="photo" onclick="apri(${i})">
    <img src="${f.src}" loading="lazy">
    ${f.date ? `<span class="date">${data(f)}</span>` : ''}
  </button>`).join('');

document.getElementById('lbClose').onclick = chiudi;
document.getElementById('lbPrev').onclick = e => { e.stopPropagation(); apri(n - 1); };
document.getElementById('lbNext').onclick = e => { e.stopPropagation(); apri(n + 1); };
lightbox.onclick = e => { if (e.target === lightbox) chiudi(); };

document.onkeydown = e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') chiudi();
  if (e.key === 'ArrowLeft') apri(n - 1);
  if (e.key === 'ArrowRight') apri(n + 1);
};

const decoro = document.getElementById('decoro');
const comparsa = new IntersectionObserver(voci => voci.forEach(v => v.target.classList.toggle('visto', v.isIntersecting)));

decoro.innerHTML = DECORO.map((src, i) => `
  <img src="${src}" style="
    top: ${6 + i * 90 / DECORO.length}%;
    ${i % 2 ? 'right' : 'left'}: ${i % 4}%;
    rotate: ${i % 2 ? 6 : -6}deg">`).join('');
decoro.querySelectorAll('img').forEach(img => comparsa.observe(img));

window.addEventListener('scroll', () => {
  decoro.querySelectorAll('img').forEach(img => {
    img.style.translate = `0 ${(img.offsetTop - scrollY) * -0.08}px`;
  });
});