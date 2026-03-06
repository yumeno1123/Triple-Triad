import urllib.request
import re
import json
import concurrent.futures

def fetch_cards():
    url = 'https://gamewith.jp/ff8/article/show/251262'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')

    # Find all card links: <a href="https://gamewith.jp/ff8/article/show/XXXXXX">カード名</a>
    links = re.findall(r'<a href="(https://gamewith.jp/ff8/article/show/\d+)".*?>(.*?)</a>', html)
    
    card_links = {}
    for link, name in links:
        if '<img' in name:
            name = re.sub(r'<img.*?>', '', name).strip()
        if '一覧' in name or '攻略' in name or 'FF8' in name or 'gacha' in name:
            continue
        if link not in card_links:
            card_links[link] = name

    def fetch_card(link_info):
        url, name = link_info
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            content = urllib.request.urlopen(req).read().decode('utf-8')
            
            top_match = re.search(r'<th>上</th>\s*<td.*?>(.*?)</td>', content)
            right_match = re.search(r'<th>右</th>\s*<td.*?>(.*?)</td>', content)
            bottom_match = re.search(r'<th>下</th>\s*<td.*?>(.*?)</td>', content)
            left_match = re.search(r'<th>左</th>\s*<td.*?>(.*?)</td>', content)
            level_match = re.search(r'<th>レベル</th>\s*<td.*?>.*?(\d+).*?</td>', content)
            
            if top_match and right_match and bottom_match and left_match and level_match:
                top = top_match.group(1).strip()
                right = right_match.group(1).strip()
                bottom = bottom_match.group(1).strip()
                left = left_match.group(1).strip()
                level = int(level_match.group(1).strip())
                
                def parse_val(v):
                    return 10 if v == 'A' else int(v)
                
                stats = [parse_val(top), parse_val(right), parse_val(bottom), parse_val(left)]
                return {'name': name, 'level': level, 'stats': stats}
        except Exception as e:
            print(f"Error fetching {name}: {e}")
        return None

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        for link, name in card_links.items():
            futures.append(executor.submit(fetch_card, (link, name)))
        for f in concurrent.futures.as_completed(futures):
            res = f.result()
            if res:
                results.append(res)
    
    results.sort(key=lambda x: x['level'])
    
    with open('C:/Users/Owner/Documents/myproject/Triple Triad/scraped_cards.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"Scraped {len(results)} cards successfully.")

if __name__ == '__main__':
    fetch_cards()
