import requests
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
from urllib.parse import urljoin

# Define the base URL and GitHub API URL
USERNAME = "ptprashanttripathi"  # Replace with the GitHub username
BASE_URL = f"https://{USERNAME}.github.io/"
GITHUB_API_URL = f"https://api.github.com/users/{USERNAME}/repos"


def fetch_repos():
    url = GITHUB_API_URL
    response = requests.get(url)
    if response.status_code == 200:
        repos = response.json()
        return [repo["name"] for repo in repos]
    return []


def fetch_page_urls(url):
    urls_set = set()
    try:
        urls_set.add(url)
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, "html.parser")
            # Fetch all anchor tags
            for link in soup.find_all("a", href=True):
                full_url = urljoin(BASE_URL, link["href"])
                if full_url.startswith(BASE_URL):
                    urls_set.add(full_url)
            # Fetch all image tags
            for img in soup.find_all("img", src=True):
                img_url = urljoin(BASE_URL, img["src"])
                if img_url.startswith(BASE_URL):
                    urls_set.add(img_url)
    except Exception as e:
        print(f"Error fetching {url}: {e}")
    return urls_set


def create_sitemap(urls):
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for url in urls:
        url_elem = ET.SubElement(urlset, "url")
        loc_elem = ET.SubElement(url_elem, "loc")
        loc_elem.text = url
        # Optionally, add more elements like <lastmod>, <changefreq>, <priority>

    tree = ET.ElementTree(urlset)
    ET.indent(tree, space="\t", level=0)

    with open("sitemap.xml", "wb") as f:
        tree.write(f, encoding="utf-8", xml_declaration=True)


if __name__ == "__main__":
    # Fetch repositories
    repos = fetch_repos()

    all_urls = set()
    for repo in repos:
        repo_url = urljoin(BASE_URL, repo + "/")
        urls = fetch_page_urls(repo_url)
        all_urls.update(urls)

    create_sitemap(all_urls)
