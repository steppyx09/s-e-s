const note = document.getElementById('status');

document.getElementById('gate').onsubmit = async e => {
  e.preventDefault();
  note.textContent = 'Apro…';

  const { salt, rounds } = await (await fetch('vault/salt.json')).json();
  const secret = new TextEncoder().encode(document.getElementById('password').value);
  const seed = await crypto.subtle.importKey('raw', secret, 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: Uint8Array.from(atob(salt), c => c.charCodeAt()), iterations: rounds, hash: 'SHA-256' },
    seed, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);

  const unseal = async file => {
    const bytes = new Uint8Array(await (await fetch(`vault/${file}`)).arrayBuffer());
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.subarray(0, 12) }, key, bytes.subarray(12));
  };

  const book = await unseal('index.bin').then(raw => JSON.parse(new TextDecoder().decode(raw)), () => null);
  if (!book) return void (note.textContent = 'Password sbagliata');

  let done = 0;
  const total = book.photos.length + book.decor.length + 3;
  const link = async ({ file, type }) => {
    const url = URL.createObjectURL(new Blob([await unseal(file)], { type }));
    note.textContent = `Sblocco ${++done}/${total}`;
    return url;
  };

  const [backdrop, leftMark, rightMark, photos, decor] = await Promise.all([
    link(book.backdrop),
    link(book.leftMark),
    link(book.rightMark),
    Promise.all(book.photos.map(async p => ({ src: await link(p), date: p.date }))),
    Promise.all(book.decor.map(link)),
  ]);

  Object.entries({ backdrop, 'left-mark': leftMark, 'right-mark': rightMark })
    .forEach(([name, url]) => document.documentElement.style.setProperty(`--${name}`, `url("${url}")`));

  Object.assign(window, { PHOTOS: photos, DECOR: decor });
  document.title = book.title;
  document.body.innerHTML = book.html;
  document.body.append(Object.assign(document.createElement('script'), { src: 'app.js' }));
};
