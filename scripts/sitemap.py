import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed

USERNAME = "ptprashanttripathi"
BASE_URL = f"https://{USERNAME}.github.io/"
GITHUB_API_URL = f"https://api.github.com/users/{USERNAME}/repos"

visited = set()
all_urls = set()

MAX_WORKERS = 20
TIMEOUT = 10

# ✅ Allowed extensions
ALLOWED_EXTENSIONS = (
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
)


def is_allowed(path):
    """
    Check if URL should be included based on extension or if it's a domain root/base file.
    """

    # Root or subfolder without extension allowed
    if path == "/" or path.endswith("/"):
        return True

    # Base domain files like robots.txt or sitemap.xml
    if "." not in path.split("/")[-1]:
        return True

    # Check extension
    return path.endswith(ALLOWED_EXTENSIONS)


def fetch_repos():
    """Fetch all repositories for the user."""
    try:
        response = requests.get(GITHUB_API_URL, timeout=TIMEOUT)
        response.raise_for_status()
        repos = response.json()
        return [repo["name"] for repo in repos]
    except Exception as e:
        print(f"Error fetching repos: {e}")
        return []


def fetch_page_urls(url):
    """Fetch and parse URLs from a given page."""
    urls_set = set()
    try:
        response = requests.get(url, timeout=TIMEOUT)
        if response.status_code != 200:
            return urls_set

        soup = BeautifulSoup(response.content, "html.parser")

        # Collect <a> tags
        for tag in soup.find_all("a", href=True):
            full_url = urljoin(BASE_URL, tag["href"])
            if full_url.startswith(BASE_URL) and is_allowed(full_url):
                urls_set.add(full_url)

        # Collect <img> tags
        for tag in soup.find_all("img", src=True):
            full_url = urljoin(BASE_URL, tag["src"])
            if full_url.startswith(BASE_URL) and is_allowed(full_url):
                urls_set.add(full_url)

        # Collect <video> tags
        for tag in soup.find_all("video", src=True):
            full_url = urljoin(BASE_URL, tag["src"])
            if full_url.startswith(BASE_URL) and is_allowed(full_url):
                urls_set.add(full_url)

        # Collect <source> tags inside <video> or <audio>
        for tag in soup.find_all("source", src=True):
            full_url = urljoin(BASE_URL, tag["src"])
            if full_url.startswith(BASE_URL) and is_allowed(full_url):
                urls_set.add(full_url)

    except Exception as e:
        print(f"Error fetching {url}: {e}")

    return urls_set


def crawl_repo(repo_name):
    """Crawl a single GitHub Pages repo starting from its base URL."""
    repo_url = urljoin(BASE_URL, repo_name + "/")
    to_visit = [repo_url]
    local_visited = set()

    while to_visit:
        current_url = to_visit.pop()
        if current_url in local_visited or current_url in visited:
            continue

        local_visited.add(current_url)
        visited.add(current_url)

        page_urls = fetch_page_urls(current_url)
        all_urls.update(page_urls)

        # Only crawl deeper into HTML pages or subfolders
        for link in page_urls:
            if link not in local_visited:
                to_visit.append(link)


def create_sitemap(urls):
    """Generate a sitemap.xml from collected URLs."""
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for url in sorted(urls):
        url_elem = ET.SubElement(urlset, "url")
        loc_elem = ET.SubElement(url_elem, "loc")
        loc_elem.text = url

    tree = ET.ElementTree(urlset)
    ET.indent(tree, space="\t", level=0)

    with open("sitemap.xml", "wb") as f:
        tree.write(f, encoding="utf-8", xml_declaration=True)


if __name__ == "__main__":
    print("Fetching repositories...")
    repos = fetch_repos()

    if not repos:
        print("No repositories found or error fetching repos.")
        exit()

    print(f"Found repos: {repos}")

    # Crawl each repo in parallel
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(crawl_repo, repo) for repo in repos]
        for future in as_completed(futures):
            future.result()

    print(f"Total URLs collected: {len(all_urls)}")

    # Create sitemap
    create_sitemap(all_urls)
    print("Sitemap generated: sitemap.xml")
