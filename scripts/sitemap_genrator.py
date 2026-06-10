import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import time

USERNAME = "ptprashanttripathi"  # GitHub username
BASE_URL = f"https://{USERNAME}.github.io/"
GITHUB_API_URL = f"https://api.github.com/users/{USERNAME}/repos"

# Global sets to avoid duplicates
visited = set()
all_urls = set()

# Config
MAX_WORKERS = 10  # Number of threads for parallel crawling
TIMEOUT = 10  # Timeout for requests


def fetch_repos():
    """Fetch all repositories of the user using GitHub API."""
    try:
        response = requests.get(GITHUB_API_URL, timeout=TIMEOUT)
        response.raise_for_status()
        repos = response.json()
        return [repo["name"] for repo in repos]
    except requests.RequestException as e:
        print(f"[ERROR] Fetching repos failed: {e}")
        return []


def is_internal_link(url):
    """Check if the URL belongs to the base domain."""
    return url.startswith(BASE_URL)


def extract_links(content, current_url):
    """Extract all relevant URLs from a page."""
    soup = BeautifulSoup(content, "html.parser")
    urls_found = set()

    # Tags and attributes to capture
    tags_attrs = {
        "a": "href",
        "img": "src",
        "link": "href",
        "script": "src",
        "source": "src",
        "video": "src",
        "audio": "src",
    }

    for tag, attr in tags_attrs.items():
        for element in soup.find_all(tag, **{attr: True}):
            raw_url = element.get(attr)
            if raw_url:
                full_url = urljoin(current_url, raw_url)
                if is_internal_link(full_url):
                    urls_found.add(full_url)

    return urls_found


def fetch_page(url):
    """Fetch a single page and extract its internal links."""
    if url in visited:
        return set()

    print(f"[CRAWLING] {url}")
    visited.add(url)

    try:
        response = requests.get(url, timeout=TIMEOUT)
        if response.status_code == 200:
            return extract_links(response.content, url)
        else:
            print(f"[WARN] Failed to fetch {url} - Status {response.status_code}")
            return set()
    except requests.RequestException as e:
        print(f"[ERROR] Request failed for {url}: {e}")
        return set()


def crawl_recursive(start_urls):
    """Recursively crawl the website using multithreading."""
    to_visit = set(start_urls)

    while to_visit:
        new_links = set()

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {executor.submit(fetch_page, url): url for url in to_visit}

            for future in as_completed(futures):
                found_links = future.result()
                for link in found_links:
                    if link not in visited:
                        new_links.add(link)
                        all_urls.add(link)

        to_visit = new_links


def create_sitemap(urls):
    """Generate sitemap.xml from a set of URLs."""
    print(f"[INFO] Generating sitemap.xml with {len(urls)} URLs...")
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    for url in sorted(urls):
        url_elem = ET.SubElement(urlset, "url")
        loc_elem = ET.SubElement(url_elem, "loc")
        loc_elem.text = url

    tree = ET.ElementTree(urlset)
    ET.indent(tree, space="\t", level=0)
    tree.write("sitemap.xml", encoding="utf-8", xml_declaration=True)


def save_as_json(urls):
    """Save all URLs as a JSON file."""
    print(f"[INFO] Saving sitemap.json with {len(urls)} URLs...")
    with open("sitemap.json", "w", encoding="utf-8") as f:
        json.dump(sorted(urls), f, indent=2)


if __name__ == "__main__":
    start_time = time.time()

    # Step 1. Fetch repositories
    print("[INFO] Fetching repositories...")
    repos = fetch_repos()
    print(f"[INFO] Found {len(repos)} repositories: {repos}")

    # Step 2. Prepare starting URLs
    start_urls = [BASE_URL] + [urljoin(BASE_URL, repo + "/") for repo in repos]
    all_urls.update(start_urls)

    # Step 3. Start recursive crawl
    crawl_recursive(start_urls)

    # Step 4. Save outputs
    create_sitemap(all_urls)
    save_as_json(all_urls)

    print(f"[DONE] Crawling completed in {time.time() - start_time:.2f} seconds")
    print(f"[INFO] Total URLs found: {len(all_urls)}")
