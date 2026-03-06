import urllib.request

urls = [
    'https://raw.githubusercontent.com/Silinde87/M1-Triple-Triad-FFVIII/master/js/cards.js',
    'https://raw.githubusercontent.com/walkerrandolphsmith/triple-triad/master/api/data/cards.json',
    'https://raw.githubusercontent.com/itdelatrisu/triple-triad-html5/master/res/xml/cards.xml'
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        content = urllib.request.urlopen(req).read().decode('utf-8')
        print(f"--- SUCCESS: {url} ---")
        print(content[:500])
    except Exception as e:
        print(f"--- FAILED: {url} ---")
        print(e)
