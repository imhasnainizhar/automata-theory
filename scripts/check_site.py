#!/usr/bin/env python3
"""Consistency checks for the Automata A to Z site (standard library only).

Checks:
  * every chapter listed in assets/site.js exists, and every chapter file is listed;
  * every internal link (page.html, page.html#anchor, #anchor) resolves;
  * every <figure class="fa"> spec is valid JSON and only references declared states;
  * dollar signs used as KaTeX delimiters are balanced outside <code>/<pre>/<script>.

Exit status is non-zero if any problem is found.
"""
from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_TEXT = {"code", "pre", "script", "style"}


def slug(text: str) -> str:
    """Mirror the heading-id logic in assets/site.js."""
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", text.lower()))


class Page(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: set[str] = set()
        self.links: list[str] = []
        self.specs: list[str] = []
        self.text: list[str] = []
        self.skip = 0
        self.h2: list[str] | None = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "a" and a.get("href"):
            self.links.append(a["href"])
        if tag == "figure" and "data-fa" in a:
            self.specs.append(a["data-fa"])
        if tag in SKIP_TEXT:
            self.skip += 1
        if tag == "h2":
            self.h2 = []

    def handle_endtag(self, tag):
        if tag in SKIP_TEXT and self.skip:
            self.skip -= 1
        if tag == "h2" and self.h2 is not None:
            self.ids.add(slug("".join(self.h2).strip()))
            self.h2 = None

    def handle_data(self, data):
        if self.h2 is not None:
            self.h2.append(data)
        if not self.skip:
            self.text.append(data)


def check_spec(raw: str) -> list[str]:
    try:
        spec = json.loads(raw)
    except json.JSONDecodeError as e:
        return [f"invalid diagram JSON: {e}"]
    errs = []
    states = spec.get("states", {})
    if not states:
        errs.append("diagram has no states")
    if spec.get("type") not in {"dfa", "nfa", "pda", "tm", "static"}:
        errs.append(f"unknown diagram type {spec.get('type')!r}")
    if spec.get("start") and spec["start"] not in states:
        errs.append(f"start state {spec['start']!r} not declared")
    for key in ("accept", "reject", "dead"):
        for q in spec.get(key, []):
            if q not in states:
                errs.append(f"{key} state {q!r} not declared")
    for e in spec.get("edges", []):
        if len(e) < 3:
            errs.append(f"edge {e} needs [from, to, label]")
            continue
        for q in e[:2]:
            if q not in states:
                errs.append(f"edge {e[:3]} uses undeclared state {q!r}")
    return errs


def main() -> int:
    pages = {p.name: p for p in sorted(ROOT.glob("*.html"))}
    parsed: dict[str, Page] = {}
    for name, path in pages.items():
        pg = Page()
        pg.feed(path.read_text(encoding="utf-8"))
        parsed[name] = pg

    problems: list[str] = []

    site_js = (ROOT / "assets" / "site.js").read_text(encoding="utf-8")
    listed = set(re.findall(r"slug: '([\w-]+)'", site_js))
    listed.discard("index")  # used only as the "previous" link of chapter 1
    files = {n[:-5] for n in pages if re.match(r"\d\d-", n)}
    for s in sorted(listed - files):
        problems.append(f"assets/site.js lists '{s}' but {s}.html does not exist")
    for s in sorted(files - listed):
        problems.append(f"{s}.html exists but is missing from CHAPTERS in assets/site.js")

    for name, pg in parsed.items():
        for href in pg.links:
            if re.match(r"^(https?:|mailto:)", href):
                continue
            target, _, frag = href.partition("#")
            if target in ("", "./"):
                target = name if href.startswith("#") else "index.html"
            if target not in parsed:
                problems.append(f"{name}: broken link {href!r}")
            elif frag and frag not in parsed[target].ids:
                problems.append(f"{name}: link {href!r} points to a missing heading")
        for i, raw in enumerate(pg.specs, 1):
            problems += [f"{name}: diagram #{i}: {m}" for m in check_spec(raw)]
        # KaTeX auto-render works per text node, so delimiters must balance within each node.
        for node in pg.text:
            singles = re.sub(r"\$\$.*?\$\$", "", node, flags=re.S)
            if singles.count("$") % 2:
                snippet = " ".join(node.split())[:70]
                problems.append(f"{name}: unbalanced '$' in “{snippet}…” — write 'dollars' in prose")

    for p in problems:
        print("✗", p)
    total_specs = sum(len(p.specs) for p in parsed.values())
    print(f"Checked {len(parsed)} pages, {total_specs} diagrams: "
          f"{'OK' if not problems else f'{len(problems)} problem(s)'}")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
