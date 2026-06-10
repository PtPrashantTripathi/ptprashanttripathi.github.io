#!/usr/bin/env python3
"""
sitemap_generator.py
────────────────────
Crawls https://PtPrashantTripathi.github.io and every GitHub-Pages repo
for the user, then generates a clean sitemap.xml.

Flow
────
1. GitHub API  →  get ALL public repos (paginated)
2. Seed URLs   →  base site + one URL per repo  (/{repo_name}/)
3. Recursive crawler (thread-pool)
   • fetches each HTML page
   • extracts links from <a href>, <form action>, <link href>,
     <img src>, <source src>, <video src>, <audio src>
   • keeps only internal URLs whose path extension is in ALLOWED_EXTENSIONS
   • strips query strings + fragments before deduplication
4. sitemap.xml →  sorted, with <lastmod> from GitHub API pushed_at date

Usage
─────
    pip install requests beautifulsoup4 lxml
    python scripts/sitemap_generator.py

Optional env vars:
    GITHUB_TOKEN   – Personal access token to raise API rate limit to 5 000 req/h
"""

import os
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlunparse
import xml.etree.ElementTree as ET

import requests
from bs4 import BeautifulSoup

# ── Configuration ─────────────────────────────────────────────────────────────

USERNAME = "PtPrashantTripathi"
BASE_DOMAIN = f"{USERNAME.lower()}.github.io"
BASE_URL = f"https://{BASE_DOMAIN}/"

GITHUB_API = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")  # optional, raises rate limit

MAX_WORKERS = 8  # parallel fetch threads
REQUEST_TIMEOUT = 12  # seconds per request
RETRY_LIMIT = 2  # retries on transient errors
CRAWL_DELAY = 0.05  # polite delay between requests (seconds)

# Only include URLs whose path ends with one of these extensions
# (empty string = no extension = plain page paths like /about or /)
ALLOWED_EXTENSIONS = {
    "",  # pages with no file extension  e.g. /about  /
    ".html",
    ".htm",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".webp",
    ".ico",
    ".mp4",
    ".webm",
    ".mov",
    ".pdf",
}

# HTML content types worth parsing for more links
HTML_CONTENT_TYPES = {"text/html", "application/xhtml+xml"}

# Output path (relative to this script's parent directory = repo root)
REPO_ROOT = Path(__file__).parent.parent
OUTPUT_XML = REPO_ROOT / "sitemap.xml"


# ── Thread-safe state ─────────────────────────────────────────────────────────

_lock = threading.Lock()
visited: set[str] = set()  # normalised URLs already fetched
discovered: set[str] = set()  # ALL valid URLs found (including assets)


# ── Helpers ───────────────────────────────────────────────────────────────────


def _session() -> requests.Session:
    """Create a requests session with optional GitHub auth."""
    s = requests.Session()
    s.headers.update(
        {
            "User-Agent": f"sitemap-generator/{USERNAME}",
            "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
        }
    )
    if GITHUB_TOKEN:
        s.headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return s


SESSION = _session()


def normalise(url: str) -> str:
    """
    Strip query string and fragment, lowercase scheme+host,
    ensure trailing slash on bare domain paths.
    Returns empty string if the URL is not worth keeping.
    """
    try:
        p = urlparse(url)
        # Drop fragments entirely – anchors are not crawlable pages
        clean = urlunparse(("https", p.netloc.lower(), p.path, "", "", ""))
        return clean.rstrip("/")
    except Exception:
        return ""


def is_internal(url: str) -> bool:
    """True if the URL lives under our GitHub Pages domain."""
    try:
        return urlparse(url).netloc.lower() == BASE_DOMAIN
    except Exception:
        return False


def allowed_extension(url: str) -> bool:
    """True if the URL's file extension is in ALLOWED_EXTENSIONS."""
    path = urlparse(url).path.rstrip("/")
    suffix = Path(path).suffix.lower() if path else ""
    return suffix in ALLOWED_EXTENSIONS


def safe_get(url: str) -> requests.Response | None:
    """GET with retries; returns None on persistent failure."""
    for attempt in range(1 + RETRY_LIMIT):
        try:
            resp = SESSION.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
            return resp
        except requests.RequestException as exc:
            if attempt == RETRY_LIMIT:
                print(f"  [SKIP] {url}  ({exc})")
                return None
            time.sleep(0.5 * (attempt + 1))
    return None


# ── GitHub API ────────────────────────────────────────────────────────────────


def fetch_repos() -> list[dict]:
    """
    Return all public repos for USERNAME via paginated GitHub API.
    Each dict has keys: name, pushed_at (ISO-8601 string).
    """
    repos: list[dict] = []
    page = 1
    print(f"\n{'─'*60}")
    print(f"  Fetching repos for {USERNAME} …")
    while True:
        url = f"{GITHUB_API}/users/{USERNAME}/repos?per_page=100&page={page}"
        resp = safe_get(url)
        if resp is None or resp.status_code != 200:
            break
        batch = resp.json()
        if not batch:
            break
        repos.extend(
            {"name": r["name"], "pushed_at": r.get("pushed_at", "")}
            for r in batch
            if not r.get("private", False) and not r.get("archived", False)
        )
        print(f"  Page {page}: +{len(batch)} repos  (total so far: {len(repos)})")
        if len(batch) < 100:
            break
        page += 1
    print(f"  → {len(repos)} public repos found")
    return repos


# ── Link extraction ───────────────────────────────────────────────────────────

_LINK_ATTRS: list[tuple[str, str]] = [
    ("a", "href"),
    ("form", "action"),
    ("link", "href"),
    ("img", "src"),
    ("source", "src"),
    ("video", "src"),
    ("audio", "src"),
]


def extract_links(html: bytes, base_url: str) -> set[str]:
    """
    Parse HTML and return the set of normalised internal URLs
    that pass the ALLOWED_EXTENSIONS filter.
    """
    soup = BeautifulSoup(html, "lxml")
    found: set[str] = set()

    for tag, attr in _LINK_ATTRS:
        for el in soup.find_all(tag, **{attr: True}):
            raw = el.get(attr, "").strip()
            if not raw or raw.startswith(("javascript:", "mailto:", "tel:", "data:")):
                continue
            full = normalise(urljoin(base_url, raw))
            if full and is_internal(full) and allowed_extension(full):
                found.add(full)

    return found


# ── Crawler ───────────────────────────────────────────────────────────────────


def crawl_url(url: str) -> set[str]:
    """
    Fetch one URL.  If it's HTML, return newly discovered internal links.
    Marks the URL as visited (thread-safe).
    """
    with _lock:
        if url in visited:
            return set()
        visited.add(url)

    time.sleep(CRAWL_DELAY)
    resp = safe_get(url)
    if resp is None:
        return set()

    if resp.status_code == 404:
        return set()

    if resp.status_code != 200:
        print(f"  [WARN] HTTP {resp.status_code}  {url}")
        return set()

    content_type = resp.headers.get("content-type", "").split(";")[0].strip()
    if content_type not in HTML_CONTENT_TYPES:
        # Asset (image / video / pdf) – valid URL, no links to extract
        return set()

    print(f"  [HTML] {url}")
    return extract_links(resp.content, url)


def crawl(seed_urls: list[str]) -> None:
    """BFS recursive crawl using a thread pool."""
    to_visit: set[str] = set(seed_urls)
    discovered.update(seed_urls)

    while to_visit:
        print(f"\n  Queue: {len(to_visit)} URLs …")
        next_wave: set[str] = set()

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
            futures = {pool.submit(crawl_url, u): u for u in to_visit}
            for fut in as_completed(futures):
                new_links = fut.result()
                for link in new_links:
                    with _lock:
                        if link not in discovered:
                            discovered.add(link)
                            next_wave.add(link)

        to_visit = next_wave


# ── Sitemap builder ───────────────────────────────────────────────────────────


def _priority(url: str) -> str:
    """Assign priority based on URL depth."""
    path = urlparse(url).path.rstrip("/")
    depth = path.count("/")
    if depth == 0:
        return "1.0"
    if depth == 1:
        return "0.8"
    if depth == 2:
        return "0.6"
    return "0.4"


def _changefreq(url: str) -> str:
    path = urlparse(url).path
    if path in ("/", ""):
        return "weekly"
    suffix = Path(path).suffix.lower()
    if suffix in {
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".svg",
        ".webp",
        ".ico",
        ".mp4",
        ".webm",
        ".mov",
        ".pdf",
    }:
        return "yearly"
    return "monthly"


def build_sitemap(urls: set[str], repo_pushed: dict[str, str]) -> None:
    """Write sitemap.xml with loc / lastmod / changefreq / priority."""

    def lastmod(url: str) -> str:
        path = urlparse(url).path.strip("/")
        repo_name = path.split("/")[0] if path else ""
        pushed = repo_pushed.get(repo_name, "")
        if pushed:
            # Convert  2024-03-15T10:22:30Z  →  2024-03-15
            return pushed[:10]
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    for url in sorted(urls):
        url_el = ET.SubElement(urlset, "url")
        ET.SubElement(url_el, "loc").text = url
        ET.SubElement(url_el, "lastmod").text = lastmod(url)
        ET.SubElement(url_el, "changefreq").text = _changefreq(url)
        ET.SubElement(url_el, "priority").text = _priority(url)

    tree = ET.ElementTree(urlset)
    ET.indent(tree, space="\t", level=0)
    tree.write(str(OUTPUT_XML), encoding="utf-8", xml_declaration=True)
    print(f"\n  ✅  Wrote {len(urls)} URLs → {OUTPUT_XML}")


# ── Entry point ───────────────────────────────────────────────────────────────


def main() -> None:
    start = time.time()

    # 1. Repos
    repos = fetch_repos()
    repo_pushed = {r["name"]: r["pushed_at"] for r in repos}

    # 2. Seed URLs: base site + each repo's GitHub Pages URL
    seeds: list[str] = [BASE_URL]
    for name in repo_pushed:
        repo_url = normalise(f"{BASE_URL}{name}/")
        if repo_url:
            seeds.append(repo_url)

    print(f"\n{'─'*60}")
    print(f"  Starting crawl from {len(seeds)} seed URLs …")

    # 3. Crawl
    crawl(seeds)

    # 4. Sitemap
    print(f"\n{'─'*60}")
    print(f"  Total discovered URLs : {len(discovered)}")
    build_sitemap(discovered, repo_pushed)

    elapsed = time.time() - start
    print(f"\n{'─'*60}")
    print(f"  Done in {elapsed:.1f}s  |  {len(discovered)} URLs in sitemap.xml")
    print(f"{'─'*60}\n")


if __name__ == "__main__":
    main()
