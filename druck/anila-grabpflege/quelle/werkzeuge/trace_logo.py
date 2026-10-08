# Logo aus dem Entwurf nachzeichnen: Schwarz + Terrakotta als Vektor (potrace), Blätter als freigestelltes Bild.
# Aufruf: python trace_logo.py logo_x4.png ausgabe_ordner
import sys, os, re, subprocess, numpy as np, cv2
K = 4  # Skalierung gegenüber dem Original-Ausschnitt (540x375)
src, outdir = sys.argv[1], sys.argv[2]; os.makedirs(outdir, exist_ok=True)
I = cv2.imread(src)[:, :, ::-1].astype(np.float32)  # RGB
H, W = I.shape[:2]

def zone_masks(shape):
    """Ausschlussbereiche (Kartendeko links, Foto rechts, Pinselfläche unten) in Original-Koordinaten."""
    m = np.zeros(shape, np.uint8)
    polys = [
        [(0, 0), (72, 0), (72, 142), (0, 142)],              # Blätter links oben
        [(0, 236), (60, 236), (60, 375), (0, 375)],          # Blätter links unten
        [(472, 236), (540, 236), (540, 375), (472, 375)],    # Foto rechts
        [(330, 375), (540, 375), (540, 286), (418, 318), (330, 356)],  # Pinselfläche unten rechts
        [(530, 0), (540, 0), (540, 236), (530, 236)],        # Rand rechts
        [(480, 0), (540, 0), (540, 80), (480, 80)],          # Fotoecke rechts oben
        [(0, 0), (100, 0), (100, 100), (0, 100)],            # Blattspitze links oben
        [(0, 0), (30, 0), (30, 375), (0, 375)],              # Rand links
        [(0, 362), (200, 362), (200, 375), (0, 375)],        # Rand unten links
    ]
    for p in polys: cv2.fillPoly(m, [np.array([(x * K, y * K) for x, y in p], np.int32)], 1)
    return m.astype(bool)

# --- schief? Grundlinie von GRABPFLEGE schätzen und geraderücken
r, g, b = I[..., 0], I[..., 1], I[..., 2]
lum = .299 * r + .587 * g + .114 * b; sat = I.max(2) - I.min(2)
blk = (lum < 110) & (sat < 45)
band = blk[226 * K:272 * K, 75 * K:440 * K]
xs, ys = [], []
for x in range(0, band.shape[1], 2):
    col = np.where(band[:, x])[0]
    if len(col): xs.append(x); ys.append(col.max())
xs, ys = np.array(xs), np.array(ys)
sel = ys > np.percentile(ys, 40)  # nur Unterkanten
a, _ = np.polyfit(xs[sel], ys[sel], 1); ang = np.degrees(np.arctan(a))
print('Neigung', round(ang, 2), 'Grad')
M = cv2.getRotationMatrix2D((W / 2, H / 2), ang, 1)
I = cv2.warpAffine(I, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
excl = cv2.warpAffine(zone_masks((H, W)).astype(np.uint8), M, (W, H), flags=cv2.INTER_NEAREST).astype(bool)
excl |= zone_masks((H, W))

r, g, b = I[..., 0], I[..., 1], I[..., 2]
lum = .299 * r + .587 * g + .114 * b; sat = I.max(2) - I.min(2)
# Hintergrund lokal schätzen (hellster Bereich, großflächig geglättet)
bg = cv2.dilate(I, np.ones((15 * K, 15 * K), np.uint8)); bg = cv2.GaussianBlur(bg, (0, 0), 12 * K)
dist = np.sqrt(((I - bg) ** 2).sum(2))

black = (lum < 135) & (sat < 45) & (g <= r + 6) & ~excl
terra = (r > g + 20) & (r > b + 14) & (lum < 222) & (lum > 70) & ~excl
green = (g >= r - 8) & (sat > 12) & (dist > 25) & ~excl

def clean(mask, min_area):
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    keep = np.zeros(n, bool); keep[1:] = st[1:, cv2.CC_STAT_AREA] >= min_area
    return keep[lab]
blz = np.zeros((H, W), bool); blz[0:222 * K, 340 * K:] = True; blz[0:250 * K, 440 * K:] = True
black = clean(black & ~blz, 10 * K)
terra_m = clean(terra, 30 * K)
n_, lab_, st_, cen_ = cv2.connectedComponentsWithStats(terra_m.astype(np.uint8), 8)
for i in range(1, n_):
    cx, cy = cen_[i]
    if 395 * K < cx < 530 * K and cy < 250 * K and st_[i, cv2.CC_STAT_AREA] < 40000: terra_m[lab_ == i] = False
# Blattbereich: Zweig im Herz (Original x 335..530, y 5..250)
leafzone = np.zeros((H, W), bool); leafzone[5 * K:140 * K, 345 * K:530 * K] = True; leafzone[140 * K:232 * K, 395 * K:530 * K] = True; leafzone[232 * K:250 * K, 440 * K:530 * K] = True
leaf_alpha = np.clip((dist - 18) / 55, 0, 1) * leafzone * ~excl

def farbe(mask):
    c = np.median(I[mask & (dist > 60)], 0); return '#%02x%02x%02x' % tuple(int(v) for v in c)
fb, ft = farbe(black), farbe(terra_m)
print('Farben', fb, ft)

def potrace(mask, name):
    pbm = os.path.join(outdir, name + '.pbm'); svg = os.path.join(outdir, name + '.svg')
    m = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 1.2) > .5
    with open(pbm, 'wb') as f:
        f.write(b'P4\n%d %d\n' % (W, H)); f.write(np.packbits(m, axis=1).tobytes())
    subprocess.run(['potrace', pbm, '-s', '-o', svg, '--flat', '-t', '15', '-a', '1.0', '-O', '0.4'], check=True)
    txt = open(svg).read(); os.remove(pbm)
    gtag = re.search(r'<g transform="([^"]+)"', txt).group(1)
    paths = re.findall(r'<path d="([^"]+)"', txt)
    return gtag, ' '.join(paths)

band = terra_m[322 * K:348 * K]
cols = np.where(band.any(0))[0]
linien = ''
if len(cols):
    yy = np.where(band.any(1))[0]; yc = 322 * K + np.median(np.where(band)[0]); th = 1.3 * K
    # Lücke um das Herz in der Mitte
    gaps = np.where(np.diff(cols) > 15 * K)[0]
    segs = []; start = cols[0]
    for gi in gaps: segs.append((start, cols[gi])); start = cols[gi + 1]
    segs.append((start, cols[-1]))
    segs = [sg for sg in segs if sg[1] - sg[0] > 40 * K]
    terra_m[322 * K:348 * K, :] &= ~np.isin(np.arange(W), np.concatenate([np.arange(a0, b0 + 1) for a0, b0 in segs]))[None, :] if segs else True
    linien = ''.join(f'<rect x="{a0}" y="{yc - th / 2:.1f}" width="{b0 - a0}" height="{th:.1f}" />' for a0, b0 in segs)
    print('Linien', segs)
gb, pb = potrace(black, 'schwarz'); gt, pt = potrace(terra_m, 'terra')
# Blätter: Farbe aus Mischung mit Hintergrund herausrechnen, Vektorflächen aussparen
vec = cv2.dilate((black | terra_m).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
stem = (r > g) & (lum < 140) & (dist > 45) & ~cv2.dilate(terra_m.astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool)
core = ((green & (dist > 35)) | stem) & leafzone & ~vec & ~excl
n_, lab_, st_, _ = cv2.connectedComponentsWithStats(core.astype(np.uint8), 8)
keep = np.zeros(n_, bool); keep[1:] = st_[1:, cv2.CC_STAT_AREA] > 400; core = keep[lab_]
reach = cv2.dilate(core.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
a = np.clip((dist - 22) / 45, 0, 1) * reach * ~vec * ~excl
a = cv2.GaussianBlur(a.astype(np.float32), (0, 0), .7)
col = np.where(a[..., None] > 0.02, (I - (1 - a[..., None]) * bg) / np.maximum(a[..., None], 0.02), 0)
col = np.clip(col, 0, 255)
ys_, xs_ = np.where(a > 0.02); y0, y1, x0, x1 = ys_.min(), ys_.max() + 1, xs_.min(), xs_.max() + 1
rgba = np.dstack([col, a * 255]).astype(np.uint8)[y0:y1, x0:x1]
cv2.imwrite(os.path.join(outdir, 'logo-blaetter.png'), cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA))

# Gesamtrahmen des Logos
allm = black | terra_m | (a > .1)
ys_, xs_ = np.where(allm); bx0, by0, bx1, by1 = xs_.min() - 8, ys_.min() - 8, xs_.max() + 8, ys_.max() + 8
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="{bx0} {by0} {bx1 - bx0} {by1 - by0}">
<g transform="{gt}" fill="{ft}" stroke="none"><path d="{pt}"/></g>
<g fill="TERRAFILL">LINIEN</g>
<image href="LEAFHREF" x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}"/>
<g transform="{gb}" fill="{fb}" stroke="none"><path d="{pb}"/></g>
</svg>'''
svg = svg.replace('TERRAFILL', ft).replace('LINIEN', linien)
open(os.path.join(outdir, 'logo.svg'), 'w').write(svg)
print('viewBox', bx0, by0, bx1 - bx0, by1 - by0)
