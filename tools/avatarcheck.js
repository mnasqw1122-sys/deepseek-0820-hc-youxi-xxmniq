/* tools/avatarcheck.js — 无依赖 PNG 解码，检验截图立绘区域确有「人形」特征 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function decodePNG(buf) {
  let pos = 8, w = 0, h = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  let plte = null;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.slice(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; interlace = data[12]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'PLTE') plte = data;
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (interlace || bitDepth !== 8) throw new Error('仅支持 8 位非隔行 PNG');
  const CH = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * CH;
  const out = Buffer.alloc(w * h * 3);
  let prev = Buffer.alloc(stride), rp = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[rp++];
    const line = Buffer.from(raw.slice(rp, rp + stride));
    rp += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= CH ? line[x - CH] : 0, b = prev[x], c = x >= CH ? prev[x - CH] : 0;
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
        default: throw new Error('滤波 ' + filter);
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

function probe(img, x0, y0, x1, y1, label, predicate, minCount) {
  let hit = 0, total = 0;
  const colors = new Set();
  for (let y = Math.floor(y0); y < Math.floor(y1); y += 2) {
    for (let x = Math.floor(x0); x < Math.floor(x1); x += 2) {
      const o = (y * img.w + x) * 3;
      const r = img.px[o], g = img.px[o + 1], b = img.px[o + 2];
      total++;
      colors.add((r >> 4) + ',' + (g >> 4) + ',' + (b >> 4));
      if (predicate(r, g, b)) hit++;
    }
  }
  console.log('  ' + label + '：' + hit + ' 命中 / ' + total + ' 采样（需 ' + minCount + '），色数 ' + colors.size);
  if (hit < minCount) throw new Error(label + ' 特征不足（' + hit + ' < ' + minCount + '）');
}

const dir = path.join(__dirname, '..', 'shots');
let fails = 0;
for (const f of ['desktop.png', 'mid.png', 'phone.png', 'tablet.png', 'combat.png']) {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) { console.log(f + '：缺截图，跳过'); continue; }
  console.log(f + '：');
  const img = decodePNG(fs.readFileSync(p));
  const isPhone = img.w < 700;
  const isCombat = f === 'combat.png';
  let regions;
  if (isCombat) {
    /* 战斗弹窗：中栏左右各一立绘 */
    regions = [[img.w * 0.16, img.h * 0.20, img.w * 0.34, img.h * 0.46, '我方立绘'],
    [img.w * 0.66, img.h * 0.20, img.w * 0.84, img.h * 0.46, '敌方立绘']];
  } else if (isPhone) {
    regions = [[8, img.h * 0.12, img.w - 8, img.h * 0.30, '立绘']];
  } else {
    regions = [[8, 62, Math.min(300, img.w * 0.21), 400, '立绘']];
  }
  for (const [x0, y0, x1, y1, label] of regions) {
    try {
      probe(img, x0, y0, x1, y1, label + '·肤色', (r, g, b) => Math.abs(r - g) < 40 && Math.abs(g - b) < 45 && r > 150 && r < 245, isCombat ? 8 : 60);
      probe(img, x0, y0, x1, y1, label + '·墨色', (r, g, b) => r < 95 && g < 95 && b < 85, isCombat ? 10 : 40);
      if (!isCombat && f === 'desktop.png') {
        probe(img, x0, y0, x1, y1, label + '·彩衣', (r, g, b) => (g - r) > 25 || (r - g) > 30 || (b - r) > 35, 25);
      }
    } catch (e) { console.log('  ✗ ' + e.message); fails++; }
  }
}
console.log(fails ? '\n✗ 立绘区域检测失败 ' + fails : '\n✓ 各视口立绘区域均呈现「人形」特征');
process.exit(fails ? 1 : 0);
