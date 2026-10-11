import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { classificaDomanda } from './oracolo.mjs';
const base = new URL('./', import.meta.url);
function parseCSV(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(field); field = ''; }
    else if (c === '\n' && !quoted) { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (quoted) throw Error('CSV non valido');
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  const [header, ...data] = rows;
  return data.map(r => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}
const manifest = JSON.parse(await readFile(new URL('MANIFEST.json', base), 'utf8'));
for (const [file, hash] of Object.entries(manifest.sha256)) {
  const actual = createHash('sha256').update(await readFile(new URL(file, base))).digest('hex');
  if (actual !== hash) throw Error('Integrità non verificata: ' + file);
}
const corpus = parseCSV(await readFile(new URL('corpus.csv', base), 'utf8'));
const data = JSON.parse(await readFile(new URL('diagnostici.json', base), 'utf8'));
const riepilogo = {};
for (const [nome, casi] of [['corpus', corpus], ['esterni', data.esterni], ['controlliMirati', data.controlliMirati]]) {
  let corrette = 0;
  const errori = [];
  for (const caso of casi) {
    const risultato = classificaDomanda(caso.domanda);
    const attesa = caso.etichetta ?? caso.attesa_proposta;
    if (risultato.etichetta === attesa) corrette++;
    else errori.push({ domanda: caso.domanda, attesa, ottenuta: risultato.etichetta });
    const snapshot = data.outputCongelati[nome][caso.domanda];
    if (JSON.stringify(risultato) !== JSON.stringify(snapshot)) throw Error('Output diverso dalla consegna: ' + caso.domanda);
  }
  if (corrette !== manifest.risultati[nome].corrette || casi.length !== manifest.risultati[nome].totale) throw Error('Conteggio diverso dalla consegna: ' + nome);
  riepilogo[nome] = { corrette, totale: casi.length, errori };
}
console.log(JSON.stringify({ integrita: 'verificata', riproduzioneConsegna: 'verificata', risultati: riepilogo }, null, 2));
