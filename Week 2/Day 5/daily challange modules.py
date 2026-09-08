import time
try:
    import requests  # type: ignore[import-not-found]
except ImportError:
    print("Error: 'requests' module not installed. Install it with: pip install requests")
    exit(1)


def webpage_load_time(url):
    start_time = time.perf_counter()

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        response.content  # Ensure the complete response is downloaded.
    except requests.RequestException as error:
        return f"Error: {error}"

    end_time = time.perf_counter()
    return end_time - start_time


websites = [
    "https://www.google.com",
    "https://www.ynetnews.com",
    "https://www.imdb.com",
]

for website in websites:
    load_time = webpage_load_time(website)

    if isinstance(load_time, float):
        print(f"{website} loaded in {load_time:.3f} seconds")
    else:
        print(f"{website}: {load_time}")