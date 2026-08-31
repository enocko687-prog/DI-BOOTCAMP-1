from datetime import datetime
import os
from importlib import import_module

try:
    plt = import_module("matplotlib.pyplot")
except ImportError:
    plt = None

try:
    OWM = import_module("pyowm").OWM
except ImportError:
    OWM = None


API_KEY = os.getenv("OPENWEATHER_API_KEY", "YOUR_API_KEY")
weather_manager = None
if OWM is not None and API_KEY != "YOUR_API_KEY":
    weather_manager = OWM(API_KEY).weather_manager()


def display_weather(city_id):
    observation = weather_manager.weather_at_id(city_id)
    weather = observation.weather
    location = observation.location

    print(f"\nWeather in {location.name}, {location.country}")
    print(f"Condition: {weather.detailed_status}")
    print(f"Temperature: {weather.temperature('celsius')['temp']} °C")
    print(f"Wind: {weather.wind()}")
    print(f"Sunrise: {weather.sunrise_time('iso')}")
    print(f"Sunset: {weather.sunset_time('iso')}")


def find_city_id(city_name):
    observation = weather_manager.weather_at_place(city_name)
    location = observation.location
    return location.id, location.name, location.country


def get_humidity_forecast(city_id, days=3):
    forecast = weather_manager.forecast_at_id(city_id, "3h")
    humidity_by_day = {}

    for weather in forecast.forecast.weathers:
        day = datetime.fromtimestamp(weather.reference_time()).date()

        if len(humidity_by_day) < days or day in humidity_by_day:
            humidity_by_day.setdefault(day, []).append(weather.humidity)

    return {
        day.strftime("%Y-%m-%d"): sum(values) / len(values)
        for day, values in list(humidity_by_day.items())[:days]
    }


def plot_humidity(humidity):
    if plt is None:
        raise RuntimeError(
            "Matplotlib is required for the humidity chart. "
            "Install it with: python -m pip install matplotlib"
        )

    dates = list(humidity.keys())
    values = list(humidity.values())

    bars = plt.bar(dates, values, color="skyblue")

    plt.ylabel("Humidity (%)")
    plt.title("Three-Day Humidity Forecast")
    plt.ylim(0, 100)
    plt.xticks(rotation=30)

    for bar, value in zip(bars, values):
        plt.text(
            bar.get_x() + bar.get_width() / 2,
            value + 2,
            f"{value:.0f}%",
            ha="center",
        )

    plt.tight_layout()
    plt.show()


def main():
    if OWM is None:
        print("PyOWM is required. Install it with: python -m pip install pyowm")
        return

    if API_KEY == "YOUR_API_KEY":
        print("Set your OpenWeatherMap API key first.")
        return

    city = input("Enter a city: ").strip()

    try:
        city_id, name, country = find_city_id(city)
        print(f"Using city: {name}, {country}")

        display_weather(city_id)
        humidity = get_humidity_forecast(city_id)
        plot_humidity(humidity)

    except Exception as error:
        print(f"Error: {error}")


if __name__ == "__main__":
    main()