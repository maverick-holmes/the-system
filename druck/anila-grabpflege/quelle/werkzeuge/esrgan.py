# Real-ESRGAN x4plus (RRDBNet), CPU, kachelweise. Aufruf: python esrgan.py modell.pth ein.png aus.png
import sys, numpy as np, torch, torch.nn as nn, torch.nn.functional as F
from PIL import Image

class RDB(nn.Module):
    def __init__(s, nf=64, gc=32):
        super().__init__()
        s.conv1 = nn.Conv2d(nf, gc, 3, 1, 1); s.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1)
        s.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1); s.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1)
        s.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1); s.l = nn.LeakyReLU(0.2, True)
    def forward(s, x):
        x1 = s.l(s.conv1(x)); x2 = s.l(s.conv2(torch.cat((x, x1), 1)))
        x3 = s.l(s.conv3(torch.cat((x, x1, x2), 1))); x4 = s.l(s.conv4(torch.cat((x, x1, x2, x3), 1)))
        return s.conv5(torch.cat((x, x1, x2, x3, x4), 1)) * 0.2 + x

class RRDB(nn.Module):
    def __init__(s, nf=64, gc=32):
        super().__init__(); s.rdb1 = RDB(nf, gc); s.rdb2 = RDB(nf, gc); s.rdb3 = RDB(nf, gc)
    def forward(s, x): return s.rdb3(s.rdb2(s.rdb1(x))) * 0.2 + x

class RRDBNet(nn.Module):
    def __init__(s, nf=64, nb=23, gc=32):
        super().__init__()
        s.conv_first = nn.Conv2d(3, nf, 3, 1, 1); s.body = nn.Sequential(*[RRDB(nf, gc) for _ in range(nb)])
        s.conv_body = nn.Conv2d(nf, nf, 3, 1, 1); s.conv_up1 = nn.Conv2d(nf, nf, 3, 1, 1)
        s.conv_up2 = nn.Conv2d(nf, nf, 3, 1, 1); s.conv_hr = nn.Conv2d(nf, nf, 3, 1, 1)
        s.conv_last = nn.Conv2d(nf, 3, 3, 1, 1); s.l = nn.LeakyReLU(0.2, True)
    def forward(s, x):
        f = s.conv_first(x); f = f + s.conv_body(s.body(f))
        f = s.l(s.conv_up1(F.interpolate(f, scale_factor=2, mode='nearest')))
        f = s.l(s.conv_up2(F.interpolate(f, scale_factor=2, mode='nearest')))
        return s.conv_last(s.l(s.conv_hr(f)))

def main(mp, ein, aus, tile=256, pad=12):
    net = RRDBNet(); sd = torch.load(mp, map_location='cpu', weights_only=True)
    net.load_state_dict(sd.get('params_ema', sd.get('params', sd)), strict=True); net.eval()
    img = np.asarray(Image.open(ein).convert('RGB')).astype(np.float32) / 255.
    H, W, _ = img.shape; out = np.zeros((H * 4, W * 4, 3), np.float32)
    t = torch.from_numpy(img).permute(2, 0, 1)[None]
    with torch.inference_mode():
        for y in range(0, H, tile):
            for x in range(0, W, tile):
                y0, x0 = max(y - pad, 0), max(x - pad, 0); y1, x1 = min(y + tile + pad, H), min(x + tile + pad, W)
                o = net(t[:, :, y0:y1, x0:x1])[0].clamp(0, 1).permute(1, 2, 0).numpy()
                ty, tx = (y - y0) * 4, (x - x0) * 4; hh, ww = (min(y + tile, H) - y) * 4, (min(x + tile, W) - x) * 4
                out[y * 4:y * 4 + hh, x * 4:x * 4 + ww] = o[ty:ty + hh, tx:tx + ww]
                print('kachel', y, x, flush=True)
    Image.fromarray((out * 255 + .5).astype(np.uint8)).save(aus)

if __name__ == '__main__':
    torch.set_num_threads(4); main(*sys.argv[1:4])
