import json
import requests
from bs4 import BeautifulSoup
import time
from datetime import datetime

# datetime object containing current date and time
now = str(datetime.now())

print("now =", now)


# Parsing data from api
def getjson(url):
    response = requests.get(url)
    return json.loads(response.text)


# Parsing metadata from url
def getBanner(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    metas = soup.find_all('meta')  #Get Meta og:image
    for m in metas:
        if m.get('property') == 'og:image':
            banner = m.get('content')
            return banner


# color name to css color code list
colors = getjson(
    'https://raw.githubusercontent.com/ozh/github-colors/master/colors.json')

# all the repos list which i want to show on website
repos_list = [
    "vedic-lang/vedic", "vedicscriptures/bhagavad-gita-api",
    "PtPrashantTripathi/IPL-2020-Prediction", "PtPrashantTripathi/linkpe",
    "PtPrashantTripathi/movieinfo", "PtPrashantTripathi/Shree-Ganesh",
    "PtPrashantTripathi/Cloud-Storage-System", "PtPrashantTripathi/Adhyatma",
    "PtPrashantTripathi/php-social-networking-site"
]

# execuation timer
start_time = time.time()

# empty list variable for repo variable
repos_data = []

# main fuction
for repo in repos_list:
    rdata = getjson(f'https://api.github.com/repos/{repo}')
    banner = getBanner(f'https://github.com/{repo}')
    data = {
        "name": rdata["name"],
        "url": rdata["html_url"],
        "description": rdata["description"],
        "banner": banner,
        "color":
        colors[rdata["language"]]["color"] if rdata["language"] else '',
        "lang": rdata["language"],
        "date": rdata["created_at"],
        "stars": rdata["stargazers_count"],
        "forks": rdata["forks"],
        "generatedOn": now
    }
    repos_data.append(data)
    print(f"{repo} done\t--- {time.time() - start_time} seconds ---")

# Serializing json
json_data = json.dumps(repos_data, indent=4)

# Writing to repos.json
with open("repos.json", "w") as outfile:
    outfile.write(json_data)

# Total execuation time
print(f"all done\t--- {time.time() - start_time} seconds ---")
