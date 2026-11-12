#!/usr/bin/env node
// pairs.mjs - makes the anonymised judge pairs for one app's redesign.
//
//   node pairs.mjs --today-desktop <png> --today-phone <png> \
//     --sketches <dir> --out <dir> [--letters AB]
//
// Contestants: T (today) plus one sketch per direction letter. Each sketch
// folder <sketches>/<L>/ holds the sketcher's two viewport renders,
// light-1280.png (1280x800) and dark-390.png (390x844). Every unordered pair
// is judged at desktop light, then at phone dark. Today's side alternates
// from pair to pair, so position carries no signal. Judge j1 gets each pair
// in one order and j2 gets it reversed. Both images of a pair are cropped to
// the shorter height, so length tells nothing.
//
// Writes <out>/j1/pN-{A,B}.png, <out>/j2/pN-{A,B}.png and <out>/KEY.json
// (which contestant each A and B is). Zero dependencies: the crop works on
// the PNG's own scanlines with node:zlib.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync, inflateSync } from 'node:zlib';

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

// Splits a PNG into its chunks and reads the header.
export function readPng(buf, name = 'image') {
  if (buf.length < 8 || !buf.subarray(0, 8).equals(SIGNATURE)) throw new Error(`${name}: not a PNG`);
  const chunks = [];
  let at = 8;
  while (at + 12 <= buf.length) {
    const len = buf.readUInt32BE(at);
    const type = buf.toString('latin1', at + 4, at + 8);
    chunks.push({ type, data: buf.subarray(at + 8, at + 8 + len) });
    at += 12 + len;
    if (type === 'IEND') break;
  }
  const ihdr = chunks[0]?.type === 'IHDR' ? chunks[0].data : null;
  if (!ihdr) throw new Error(`${name}: no IHDR chunk`);
  const header = {
    width: ihdr.readUInt32BE(0),
    height: ihdr.readUInt32BE(4),
    bitDepth: ihdr[8],
    colorType: ihdr[9],
    interlace: ihdr[12],
  };
  if (!(header.colorType in CHANNELS)) throw new Error(`${name}: unknown colour type ${header.colorType}`);
  return { header, chunks };
}

// Keeps the top `height` rows. A non-interlaced PNG's filters refer only to
// the row above, so the first rows' filtered bytes stay valid as they are.
export function cropPng(buf, height, name = 'image') {
  const { header, chunks } = readPng(buf, name);
  if (header.interlace !== 0) throw new Error(`${name}: interlaced PNGs are not supported`);
  if (!Number.isInteger(height) || height < 1) throw new Error(`${name}: bad crop height ${height}`);
  if (height >= header.height) return buf;
  const stride = Math.ceil((header.width * CHANNELS[header.colorType] * header.bitDepth) / 8) + 1;
  const raw = inflateSync(Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data)));
  if (raw.length < header.height * stride) throw new Error(`${name}: image data is shorter than its header says`);
  const ihdr = Buffer.from(chunks[0].data);
  ihdr.writeUInt32BE(height, 4);
  const firstIdat = chunks.findIndex((c) => c.type === 'IDAT');
  const before = chunks.slice(1, firstIdat).map((c) => chunk(c.type, c.data));
  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', ihdr),
    ...before,
    chunk('IDAT', deflateSync(raw.subarray(0, height * stride))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Every unordered pair of contestants, today first, with today's side
// alternating: pair i keeps its order when i is even and is swapped when odd.
export function planPairs(letters) {
  const names = ['T', ...letters];
  const combos = [];
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) combos.push([names[i], names[j]]);
  return combos.map((c, i) => (i % 2 === 0 ? c : [c[1], c[0]]));
}

export const VIEWPORTS = [
  { vp: '1280', sketch: 'light-1280.png' },
  { vp: '390', sketch: 'dark-390.png' },
];

export function makePairs({ todayDesktop, todayPhone, sketches, out, letters = 'AB' }) {
  if (!/^[A-SU-Z]+$/.test(letters) || new Set(letters).size !== letters.length) {
    throw new Error(`--letters must be distinct capital letters other than T, got "${letters}"`);
  }
  const src = { 1280: { T: todayDesktop }, 390: { T: todayPhone } };
  for (const L of letters) for (const { vp, sketch } of VIEWPORTS) src[vp][L] = join(sketches, L, sketch);
  for (const { vp } of VIEWPORTS) {
    for (const [who, file] of Object.entries(src[vp])) if (!existsSync(file)) throw new Error(`missing ${who} at ${vp}: ${file}`);
  }
  const combos = planPairs([...letters]);
  const key = {};
  let n = 0;
  for (const { vp } of VIEWPORTS) {
    for (const [a, b] of combos) {
      n++;
      const ia = readFileSync(src[vp][a]);
      const ib = readFileSync(src[vp][b]);
      const ha = readPng(ia, src[vp][a]).header;
      const hb = readPng(ib, src[vp][b]).header;
      if (ha.width !== hb.width) {
        throw new Error(`p${n} (${vp}): ${a} is ${ha.width} px wide and ${b} is ${hb.width} px; render both at the same width`);
      }
      const h = Math.min(ha.height, hb.height);
      const img = { [a]: cropPng(ia, h, src[vp][a]), [b]: cropPng(ib, h, src[vp][b]) };
      for (const [j, [x, y]] of [['j1', [a, b]], ['j2', [b, a]]]) {
        const dir = join(out, j);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, `p${n}-A.png`), img[x]);
        writeFileSync(join(dir, `p${n}-B.png`), img[y]);
        key[`${j}/p${n}`] = { vp, A: x, B: y };
      }
    }
  }
  writeFileSync(join(out, 'KEY.json'), JSON.stringify(key, null, 1) + '\n');
  return { n, combos, key };
}

function parseArgs(argv) {
  const flags = { '--today-desktop': 'todayDesktop', '--today-phone': 'todayPhone', '--sketches': 'sketches', '--out': 'out', '--letters': 'letters' };
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const name = flags[argv[i]];
    if (!name || argv[i + 1] === undefined) throw new Error(`unknown or incomplete argument: ${argv[i]}`);
    opts[name] = argv[++i];
  }
  for (const need of ['todayDesktop', 'todayPhone', 'sketches', 'out']) {
    if (!opts[need]) throw new Error(`missing --${need.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}`);
  }
  for (const k of ['todayDesktop', 'todayPhone', 'sketches', 'out']) opts[k] = resolve(opts[k]);
  return opts;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { n, combos } = makePairs(parseArgs(process.argv.slice(2)));
    const plan = combos.map((c, i) => `p${i + 1}=${c[0]}v${c[1]}`).join(' ');
    console.log(`${n} pairs per judge; ${plan} at 1280 light, then the same at 390 dark (p${combos.length + 1}-p${n}); j2 reversed`);
  } catch (err) {
    console.error(`pairs: ${err.message}`);
    console.error('usage: node pairs.mjs --today-desktop <png> --today-phone <png> --sketches <dir> --out <dir> [--letters AB]');
    process.exit(1);
  }
}
