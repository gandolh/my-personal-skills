import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { deflateSync, inflateSync } from 'node:zlib';
import { chunk, cropPng, planPairs, readPng } from './pairs.mjs';

const CLI = fileURLToPath(new URL('./pairs.mjs', import.meta.url));
const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// --- a tiny PNG encoder and decoder for 8-bit RGB and RGBA, built at run time ---

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

// pixels: Buffer of width*height*bpp bytes. Row r uses filter r % 5, so every
// filter type appears, and rows below depend on the rows above.
function encode(width, height, bpp, pixels, { interlace = 0 } = {}) {
  const stride = width * bpp;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let r = 0; r < height; r++) {
    const f = r % 5;
    raw[r * (stride + 1)] = f;
    for (let i = 0; i < stride; i++) {
      const x = pixels[r * stride + i];
      const a = i >= bpp ? pixels[r * stride + i - bpp] : 0;
      const b = r > 0 ? pixels[(r - 1) * stride + i] : 0;
      const c = r > 0 && i >= bpp ? pixels[(r - 1) * stride + i - bpp] : 0;
      const pred = [0, a, b, (a + b) >> 1, paeth(a, b, c)][f];
      raw[r * (stride + 1) + 1 + i] = (x - pred) & 0xff;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = bpp === 4 ? 6 : 2;
  ihdr[12] = interlace;
  const data = deflateSync(raw);
  // two IDAT chunks, to check they are joined
  const half = data.length >> 1;
  return Buffer.concat([SIG, chunk('IHDR', ihdr), chunk('IDAT', data.subarray(0, half)), chunk('IDAT', data.subarray(half)), chunk('IEND', Buffer.alloc(0))]);
}

function decode(buf) {
  const { header, chunks } = readPng(buf);
  const bpp = header.colorType === 6 ? 4 : 3;
  const stride = header.width * bpp;
  const raw = inflateSync(Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data)));
  assert.equal(raw.length, header.height * (stride + 1), 'IDAT holds exactly height rows');
  const out = Buffer.alloc(header.height * stride);
  for (let r = 0; r < header.height; r++) {
    const f = raw[r * (stride + 1)];
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? out[r * stride + i - bpp] : 0;
      const b = r > 0 ? out[(r - 1) * stride + i] : 0;
      const c = r > 0 && i >= bpp ? out[(r - 1) * stride + i - bpp] : 0;
      const pred = [0, a, b, (a + b) >> 1, paeth(a, b, c)][f];
      out[r * stride + i] = (raw[r * (stride + 1) + 1 + i] + pred) & 0xff;
    }
  }
  return { header, pixels: out };
}

function pattern(width, height, bpp, seed) {
  const p = Buffer.alloc(width * height * bpp);
  let s = seed;
  for (let i = 0; i < p.length; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    p[i] = (s >> 16) & 0xff;
  }
  return p;
}

// --- the pair plan ---

test('two directions: three pairs per viewport, today alternating, as the atrium judging used', () => {
  assert.deepEqual(planPairs(['A', 'B']), [['T', 'A'], ['B', 'T'], ['A', 'B']]);
});

test('three directions: six pairs per viewport, every unordered pair once', () => {
  const plan = planPairs(['A', 'B', 'C']);
  assert.equal(plan.length, 6);
  assert.deepEqual(plan, [['T', 'A'], ['B', 'T'], ['T', 'C'], ['B', 'A'], ['A', 'C'], ['C', 'B']]);
  const unordered = new Set(plan.map((p) => [...p].sort().join('')));
  assert.equal(unordered.size, 6);
  // today is on the left, then the right, then the left
  assert.deepEqual(plan.filter((p) => p.includes('T')).map((p) => p.indexOf('T')), [0, 1, 0]);
});

// --- the crop ---

for (const bpp of [3, 4]) {
  test(`crop keeps the top rows pixel for pixel (${bpp === 3 ? 'RGB' : 'RGBA'}, every filter type)`, () => {
    const [w, h] = [13, 23];
    const px = pattern(w, h, bpp, 7 + bpp);
    const png = encode(w, h, bpp, px);
    assert.deepEqual(decode(png).pixels, px, 'the test encoder round-trips');
    for (const keep of [1, 5, 11, 22]) {
      const cut = decode(cropPng(png, keep));
      assert.equal(cut.header.height, keep);
      assert.equal(cut.header.width, w);
      assert.deepEqual(cut.pixels, px.subarray(0, keep * w * bpp), `top ${keep} rows`);
    }
    assert.equal(cropPng(png, h), png, 'a crop to the full height returns the image unchanged');
  });
}

test('crop refuses an interlaced PNG and a file that is not a PNG', () => {
  const png = encode(4, 4, 3, pattern(4, 4, 3, 1), { interlace: 1 });
  assert.throws(() => cropPng(png, 2), /interlaced/);
  assert.throws(() => cropPng(Buffer.from('not an image'), 2), /not a PNG/);
});

// --- the command, end to end ---

function scene(dir, { phoneWidthB = 39 } = {}) {
  // Scaled-down stand-ins: 128 for 1280 and 39 for 390, with different heights.
  const write = (file, w, h, seed) => {
    mkdirSync(join(file, '..'), { recursive: true });
    const px = pattern(w, h, 3, seed);
    writeFileSync(file, encode(w, h, 3, px));
    return px;
  };
  const px = {
    T1280: write(join(dir, 'today', 'light-1280.png'), 128, 80, 1),
    T390: write(join(dir, 'today', 'dark-390.png'), 39, 90, 2),
    A1280: write(join(dir, 'sketches', 'A', 'light-1280.png'), 128, 60, 3),
    A390: write(join(dir, 'sketches', 'A', 'dark-390.png'), 39, 84, 4),
    B1280: write(join(dir, 'sketches', 'B', 'light-1280.png'), 128, 95, 5),
    B390: write(join(dir, 'sketches', 'B', 'dark-390.png'), phoneWidthB, 70, 6),
  };
  return px;
}

const run = (dir, extra = []) =>
  spawnSync(process.execPath, [CLI, '--today-desktop', join(dir, 'today', 'light-1280.png'), '--today-phone', join(dir, 'today', 'dark-390.png'), '--sketches', join(dir, 'sketches'), '--out', join(dir, 'out'), ...extra], { encoding: 'utf8' });

test('two directions end to end: the atrium key, j2 reversed, each pair cropped to the shorter height', () => {
  const dir = mkdtempSync(join(tmpdir(), 'design-pairs-'));
  try {
    const px = scene(dir);
    const r = run(dir);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /^6 pairs per judge; p1=TvA p2=BvT p3=AvB/);
    const key = JSON.parse(readFileSync(join(dir, 'out', 'KEY.json'), 'utf8'));
    const expected = {};
    const plan = [['T', 'A'], ['B', 'T'], ['A', 'B']];
    ['1280', '390'].forEach((vp, v) =>
      plan.forEach(([a, b], i) => {
        const n = v * 3 + i + 1;
        expected[`j1/p${n}`] = { vp, A: a, B: b };
        expected[`j2/p${n}`] = { vp, A: b, B: a };
      }),
    );
    assert.deepEqual(key, expected);
    for (const [id, { vp, A, B }] of Object.entries(key)) {
      const [j, p] = id.split('/');
      const a = decode(readFileSync(join(dir, 'out', j, `${p}-A.png`)));
      const b = decode(readFileSync(join(dir, 'out', j, `${p}-B.png`)));
      assert.equal(a.header.height, b.header.height, `${id}: same height`);
      const w = a.header.width;
      assert.deepEqual(a.pixels, px[A + vp].subarray(0, a.pixels.length), `${id}: A is ${A}`);
      assert.deepEqual(b.pixels, px[B + vp].subarray(0, b.pixels.length), `${id}: B is ${B}`);
      const shorter = Math.min(px[A + vp].length, px[B + vp].length) / (w * 3);
      assert.equal(a.header.height, shorter, `${id}: cropped to the shorter`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the command refuses unequal widths, a missing sketch and bad letters', () => {
  const dir = mkdtempSync(join(tmpdir(), 'design-pairs-bad-'));
  try {
    scene(dir, { phoneWidthB: 78 });
    let r = run(dir);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /39 px wide and .* 78 px|78 px wide and .* 39 px/);
    r = run(dir, ['--letters', 'ABC']);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /missing C at 1280/);
    r = run(dir, ['--letters', 'AT']);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /other than T/);
    r = spawnSync(process.execPath, [CLI, '--out', join(dir, 'out')], { encoding: 'utf8' });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /missing --today-desktop/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
