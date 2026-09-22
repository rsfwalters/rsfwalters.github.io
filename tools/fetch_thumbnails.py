#!/usr/bin/env python3
"""Download the paper thumbnails that were found on co-authors' project pages.

Run once from the site root:

    python3 tools/fetch_thumbnails.py

Each image is saved into publications/images/ under the filename that
data/publications.js already points at, so the site picks them up with no
further edits. If Pillow is installed the images are resized to 400px wide
and saved as JPEG, which keeps them small; without it the originals are
saved as-is (fine, just larger).

Re-running skips anything already downloaded. Pass --force to re-fetch.
Until you run this, the site simply shows those entries without a thumbnail:
the layout hides images that fail to load.
"""
import os, sys, urllib.request, io

DEST = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..',
                    'publications', 'images')

IMAGES = [
    ("https://jypark0.github.io/publication/2026-icml-symmetry-discovery/featured.png",
     "lieflow.jpg"),  # Discovering Symmetry Groups with Flow Matching
    ("https://um-ei.github.io/assets/publications/equidiff.png",
     "equidiff-ijrr.jpg"),  # Equivariant diffusion policy for sample-efficient robotic 
    ("https://um-ei.github.io/assets/publications/haibo_gsl.png",
     "gsl.jpg"),  # Generalizable hierarchical skill learning via object-centr
    ("https://um-ei.github.io/assets/publications/boce_i2s.gif",
     "isp-3d.jpg"),  # 3D Equivariant Visuomotor Policy Learning via Spherical Pr
    ("https://um-ei.github.io/assets/publications/rel_traj.png",
     "sym-in-dp.jpg"),  # A Practical Guide for Incorporating Symmetry in Diffusion 
    ("https://um-ei.github.io/assets/publications/haibo_hep.png",
     "hierequipo.jpg"),  # Hierarchical equivariant policy via frame transfer
    ("https://um-ei.github.io/assets/publications/equidiff.gif",
     "equidiff.jpg"),  # SE(3)-Equivariant Diffusion Policy in Spherical Fourier Sp
    ("https://um-ei.github.io/assets/publications/mingxi_gem.png",
     "gem.jpg"),  # Learning Efficient and Robust Language-conditioned Manipul
    ("https://um-ei.github.io/assets/publications/boce_push_grasp.png",
     "equipushgrasp.jpg"),  # Push-Grasp Policy Learning Using Equivariant Models and Gr
    ("https://um-ei.github.io/assets/publications/haojie_match.png",
     "match-policy.jpg"),  # Match Policy: A Simple Pipeline from Point Cloud Registrat
    ("https://um-ei.github.io/assets/publications/boce_orbit.png",
     "orbitgrasp.jpg"),  # OrbitGrasp: SE(3)-Equivariant Grasp Learning
    ("https://um-ei.github.io/assets/publications/rss_grasp.jpeg",
     "sample-efficient-grasp.jpg"),  # Sample Efficient Grasp Learning Using Equivariant Models
]

try:
    from PIL import Image
    HAVE_PIL = True
except ImportError:
    HAVE_PIL = False
    print('Pillow not installed - saving originals without resizing.')
    print('  pip install pillow   (optional, but keeps the files small)\n')


def save(data, path):
    if not HAVE_PIL:
        open(path, 'wb').write(data)
        return len(data)
    im = Image.open(io.BytesIO(data))
    im.seek(0)                      # first frame, for animated GIFs
    im = im.convert('RGB')
    if im.width > 400:
        im = im.resize((400, round(im.height * 400 / im.width)), Image.LANCZOS)
    im.save(path, 'JPEG', quality=82, optimize=True)
    return os.path.getsize(path)


def main():
    force = '--force' in sys.argv
    os.makedirs(DEST, exist_ok=True)
    ok = skipped = failed = 0
    for url, name in IMAGES:
        path = os.path.join(DEST, name)
        if os.path.exists(path) and not force:
            print('skip    %s' % name); skipped += 1; continue
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            data = urllib.request.urlopen(req, timeout=30).read()
            size = save(data, path)
            print('saved   %-28s %6.0f KB' % (name, size / 1024)); ok += 1
        except Exception as e:
            print('FAILED  %-28s %s' % (name, e)); failed += 1
    print('\n%d saved, %d skipped, %d failed' % (ok, skipped, failed))
    if failed:
        print('Failures usually mean the author moved or renamed the file.')
        print('Find the new image, save it under the same name, or clear the')
        print('"image" field for that paper in data/publications.js.')


if __name__ == '__main__':
    main()
