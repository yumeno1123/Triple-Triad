import urllib.request
from bs4 import BeautifulSoup
import re
import json

def fetch_fandom():
    url = "https://finalfantasy.fandom.com/wiki/Triple_Triad_cards"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        soup = BeautifulSoup(html, 'html.parser')
        
        # Fandom usually has tables with class 'article-table' or 'wikitable'.
        tables = soup.find_all('table', class_=['article-table', 'wikitable'])
        
        cards = []
        
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cols = row.find_all(['td', 'th'])
                # Need to find rows where standard card data exists.
                # Usually: [Icon] [Name] [Level] [Top, Right, Bottom, Left] ...
                # Let's just dump the text of the cells for debugging first.
                row_data = [col.get_text(strip=True) for col in cols]
                if len(row_data) > 3:
                    cards.append(row_data)
        
        with open('C:/Users/Owner/Documents/myproject/fandom_cards_dump.json', 'w', encoding='utf-8') as f:
            json.dump(cards, f, ensure_ascii=False, indent=2)
            
        print(f"Dumped {len(cards)} rows.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    fetch_fandom()
