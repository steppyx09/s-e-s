const stato = document.getElementById('stato');

document.getElementById('sblocca').onsubmit = async e => {
  e.preventDefault();
  stato.textContent = 'Apro…';

  const { sale, giri } = await (await fetch('dati/sale.json')).json();
  const testo = new TextEncoder().encode(document.getElementById('password').value);
  const base = await crypto.subtle.importKey('raw', testo, 'PBKDF2', false, ['deriveKey']);
  const chiave = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: Uint8Array.from(atob(sale), c => c.charCodeAt(0)), iterations: giri, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);

  async function decifra(file) {
    const dati = new Uint8Array(await (await fetch('dati/' + file)).arrayBuffer());
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: dati.slice(0, 12) }, chiave, dati.slice(12));
  }

  let elenco;
  try {
    elenco = JSON.parse(new TextDecoder().decode(await decifra('elenco.bin')));
  } catch {
    stato.textContent = 'Password sbagliata';
    return;
  }

  let fatte = 0;
  const totale = elenco.foto.length + elenco.decoro.length + 3;
  async function url({ file, tipo }) {
    const blob = new Blob([await decifra(file)], { type: tipo });
    stato.textContent = `Sblocco ${++fatte}/${totale}`;
    return URL.createObjectURL(blob);
  }

  const [sfondo, tlou, mele, foto, decoro] = await Promise.all([
    url(elenco.sfondo),
    url(elenco.tlou),
    url(elenco.mele),
    Promise.all(elenco.foto.map(async f => ({ src: await url(f), date: f.date }))),
    Promise.all(elenco.decoro.map(url)),
  ]);

  const radice = document.documentElement.style;
  radice.setProperty('--sfondo', `url("${sfondo}")`);
  radice.setProperty('--tlou', `url("${tlou}")`);
  radice.setProperty('--mele', `url("${mele}")`);

  window.FOTO = foto;
  window.DECORO = decoro;
  document.title = 'S & S';
  document.body.innerHTML = elenco.html;

  const script = document.createElement('script');
  script.src = 'app.js';
  document.body.append(script);
};
