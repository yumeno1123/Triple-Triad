import urllib.request
import json
import time

url = 'https://api.github.com/search/code?q=geezard+funguar+bite+bug+red+bat+blobra+extension:json'
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0Python'})
    resp = urllib.request.urlopen(req).read().decode('utf-8')
    data = json.loads(resp)
    
    # Just print the raw_url of the first few items
    for item in data.get('items', [])[:3]:
        # raw_url usually replaces "github.com" with "raw.githubusercontent.com" and removes "blob/"
        html_url = item['html_url']
        raw_url = html_url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/')
        print(raw_url)
except Exception as e:
    print(f'Error: {e}')
