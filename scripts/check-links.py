#!/usr/bin/env python3
"""Verifica link interni, immagini, script e ancore. Uso: python3 scripts/check-links.py"""
import re, sys, pathlib
from html.parser import HTMLParser
root = pathlib.Path(__file__).resolve().parent.parent
pages = sorted(root.glob('*.html')); ids, refs = {}, []
class P(HTMLParser):
    def __init__(s, f): super().__init__(); s.f = f; ids[f.name] = set()
    def handle_starttag(s, t, a):
        a = dict(a)
        if a.get('id'): ids[s.f.name].add(a['id'])
        for k in ('href', 'src'):
            if a.get(k): refs.append((s.f.name, a[k]))
for p in pages: P(p).feed(p.read_text())
bad = 0
for f, r in refs:
    if re.match(r'(https?:|mailto:|tel:|data:)', r): continue
    path, _, frag = r.partition('#'); path = path.split('?')[0] or f
    t = root / path
    if not t.exists(): print(f'KO  {f}: {r} (file mancante)'); bad += 1; continue
    if frag and t.suffix == '.html' and frag not in ids.get(t.name, set()): print(f'KO  {f}: {r} (ancora mancante)'); bad += 1
print(f'{len(refs)} riferimenti, {bad} errori'); sys.exit(1 if bad else 0)
