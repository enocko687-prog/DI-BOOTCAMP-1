from urllib.error import URLError, HTTPError
from urllib.parse import urlencode
from urllib.request import urlopen


API_KEY = "hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My"
BASE_URL = "https://api.giphy.com/v1/gifs"


def search_gifs(term, limit=10):
    params = urlencode({"q": term, "rating": "g", "api_key": API_KEY, "limit": limit})
    try:
        with urlopen(f"{BASE_URL}/search?{params}") as response:
            gifs = __import__("json").load(response)["data"]
    except (HTTPError, URLError, ValueError):
        return []

    return [
        gif for gif in gifs
        if int(gif["images"]["original"]["height"]) > 100
    ]


def get_trending_gifs(limit=10):
    params = urlencode({"api_key": API_KEY, "limit": limit, "rating": "g"})
    try:
        with urlopen(f"{BASE_URL}/trending?{params}") as response:
            return __import__("json").load(response)["data"]
    except (HTTPError, URLError, ValueError):
        return []
def main():
    term = input("Enter a search term: ").strip()

    if not term:
        print("No term entered. Showing today's trending GIFs.")
        gifs = get_trending_gifs()
    else:
        gifs = search_gifs(term)

        if not gifs:
            print(f"No GIFs found for '{term}'. Showing trending GIFs.")
            gifs = get_trending_gifs()

    print(f"Number of GIFs: {len(gifs)}")

    for gif in gifs:
        print(gif["url"])


if __name__ == "__main__":
    main()