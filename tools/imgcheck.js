/* ============================================================
 * tools/imgcheck.js — 无依赖 PNG 解码与画面体检
 *   用法：node tools/imgcheck.js [shots目录]
 *   检查：非空白、色域合理（宣纸/墨/朱砂）、分区有内容、山水层有变化
 * ============================================================ */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('非 PNG');
  let pos = 8, w = 0, h = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  let plte = null, trns = null;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.slice(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'PLTE') plte = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (interlace) throw new Error('不支持隔行扫描 PNG');
  if (bitDepth !== 8) throw new Error('仅支持 8 位深，实为 ' + bitDepth);
  const CH = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!CH) throw new Error('不支持的色彩类型 ' + colorType);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * CH;
  const out = Buffer.alloc(w * h * 3);
  let prev = Buffer.alloc(stride);
  let rp = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[rp++];
    const line = Buffer.from(raw.slice(rp, rp + stride));
    rp += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= CH ? line[x - CH] : 0;
      const b = prev[x];
      const c = x >= CH ? prev[x - CH] : 0;
      let v = line[x];
      switch (filter) {
        case 0: break;
        case 1: v = (v + a) & 255; break;
        case 2: v = (v + b) & 255; break;
        case 3: v = (v + ((a + b) >> 1)) & 255; break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = (v + (pa <= pb && pa <= pc ? a : (pb <= pc ? b : c))) & 255;
          break;
        }
        default: throw new Error('未知滤波 ' + filter);
      }
      line[x] = v;
    }
    for (let x = 0; x < w; x++) {
      let r, g, bl;
      if (colorType === 2 || colorType === 6) { r = line[x * CH]; g = line[x * CH + 1]; bl = line[x * CH + 2]; }
      else if (colorType === 0 || colorType === 4) { r = g = bl = line[x * CH]; }
      else { const i = line[x] * 3; r = plte[i]; g = plte[i + 1]; bl = plte[i + 2]; }
      const o = (y * w + x) * 3;
      out[o] = r; out[o + 1] = g; out[o + 2] = bl;
    }
    prev = line;
  }
  return { w, h, px: out };
}

function region(img, x0, y0, x1, y1) {
  let n = 0, sr = 0, sg = 0, sb = 0;
  let min = 255, max = 0;
  const hist = new Array(16).fill(0);
  const seen = new Set();
  for (let y = Math.floor(y0); y < Math.floor(y1); y++) {
    for (let x = Math.floor(x0); x < Math.floor(x1); x++) {
      const o = (y * img.w + x) * 3;
      const r = img.px[o], g = img.px[o + 1], b = img.px[o + 2];
      sr += r; sg += g; sb += b; n++;
      const lum = (r * 299 + g * 587 + b * 114) / 1000;
      if (lum < min) min = lum;
      if (lum > max) max = lum;
      hist[Math.min(15, lum >> 4)]++;
      if (n % 7 === 0) seen.add((r >> 3) * 1024 + (g >> 3) * 32 + (b >> 3));
    }
  }
  const mr = sr / n, mg = sg / n, mb = sb / n;
  let varsum = 0;
  for (let i = 0; i < 16; i++) varsum += hist[i] > 0 ? 1 : 0;
  return {
    n, r: Math.round(mr), g: Math.round(mg), b: Math.round(mb),
    lum: Math.round((mr * 299 + mg * 587 + mb * 114) / 1000),
    contrast: Math.round(max - min), bands: varsum, colors: seen.size
  };
}

const dir = process.argv[2] || path.join(__dirname, '..', 'shots');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort();
if (!files.length) { console.log('无截图'); process.exit(1); }

const errs = [], warns = [];
console.log('画面体检　' + dir + '\n');
console.log('场景          尺寸        全图亮度 对比 色数   顶栏  左栏  中栏  右栏   判定');
console.log('─'.repeat(100));

for (const f of files) {
  const name = path.basename(f, '.png');
  let img;
  try { img = decodePNG(fs.readFileSync(path.join(dir, f))); }
  catch (e) { errs.push(name + ': 解码失败 ' + e.message); continue; }
  const W = img.w, H = img.h;
  const all = region(img, 0, 0, W, H);
  const isPhone = W < 700;
  const top = region(img, 0, 0, W, Math.min(56, H * 0.08));
  const left = isPhone ? region(img, 0, H * 0.10, W * 0.98, H * 0.30) : region(img, 8, 70, Math.min(276, W * 0.2), H * 0.9);
  const mid = isPhone ? region(img, 0, H * 0.34, W * 0.98, H * 0.9) : region(img, W * 0.22, 70, W * 0.76, H * 0.9);
  const right = isPhone ? mid : region(img, W * 0.80, 70, W - 8, H * 0.9);

  const notes = [];
  /* 1. 非空白 */
  if (all.colors < 40) errs.push(name + ': 画面近乎单色（色数 ' + all.colors + '）');
  if (all.contrast < 60) errs.push(name + ': 全图对比过低（' + all.contrast + '）');
  /* 2. 宣纸基调：整体偏暖亮 */
  if (all.lum < 70) warns.push(name + ': 整体偏暗（亮度 ' + all.lum + '）');
  if (all.r < all.b) warns.push(name + ': 色偏冷（R' + all.r + ' < B' + all.b + '），水墨宣纸应偏暖');
  /* 3. 各区有内容 */
  const modal = ['trib', 'combat', 'furnace', 'event', 'intro', 'help'].includes(name);
  [['顶栏', top], ['左栏', left], ['中栏', mid]].forEach(([n2, rg]) => {
    if (rg.colors < 12) errs.push(name + ': ' + n2 + '几无内容（色数 ' + rg.colors + '）');
    if (rg.contrast < 25) warns.push(name + ': ' + n2 + '对比偏低（' + rg.contrast + '）');
  });
  if (!isPhone && !modal && right.colors < 12) errs.push(name + ': 右栏几无内容');
  /* 4. 弹窗场景应有暗罩 —— help 弹窗高过视口，顶条即其纸面头部，例外 */
  if (modal && name !== 'help' && top.lum > 200) warns.push(name + ': 弹窗未见暗罩（顶栏亮度 ' + top.lum + '）');
  if (modal) notes.push('弹窗');
  /* 5. 山水背景：底部应有墨色渐变（非弹窗场景） */
  if (!modal) {
    const band1 = region(img, 0, H * 0.62, W, H * 0.70);
    const band2 = region(img, 0, H * 0.88, W, H * 0.96);
    if (Math.abs(band1.lum - band2.lum) < 4 && band1.bands < 6) {
      warns.push(name + ': 山水层次不足（' + band1.lum + '→' + band2.lum + '）');
    } else notes.push('山水层次 ' + band1.lum + '→' + band2.lum);
  }
  console.log(
    name.padEnd(14) + (W + 'x' + H).padEnd(12) +
    String(all.lum).padEnd(9) + String(all.contrast).padEnd(5) + String(all.colors).padEnd(7) +
    String(top.colors).padEnd(6) + String(left.colors).padEnd(6) + String(mid.colors).padEnd(6) + String(right.colors).padEnd(7) +
    (notes.join(' · ') || '—')
  );
}

console.log('');
if (warns.length) { console.log('警告 ' + warns.length + ' 条：'); warns.forEach(w => console.log('  ⚠ ' + w)); }
if (errs.length) { console.log('错误 ' + errs.length + ' 条：'); errs.forEach(e => console.log('  ✗ ' + e)); process.exit(1); }
console.log('✓ 画面体检通过（警告 ' + warns.length + ' 条）');
