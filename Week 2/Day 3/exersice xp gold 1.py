from datetime import date, timedelta
import calendar


def us_holidays(year):
    holidays = {
        date(year, 1, 1): "New Year's Day",
        date(year, 6, 19): "Juneteenth",
        date(year, 7, 4): "Independence Day",
        date(year, 11, 11): "Veterans Day",
        date(year, 12, 25): "Christmas Day",
    }

    for month, weekday, occurrence, name in [
        (1, calendar.MONDAY, 3, "Martin Luther King Jr. Day"),
        (2, calendar.MONDAY, 3, "Washington's Birthday"),
        (9, calendar.MONDAY, 1, "Labor Day"),
        (10, calendar.MONDAY, 2, "Columbus Day"),
    ]:
        first = date(year, month, 1)
        offset = (weekday - first.weekday()) % 7
        holidays[first + timedelta(days=offset + 7 * (occurrence - 1))] = name

    last_may = date(year, 6, 1) - timedelta(days=1)
    holidays[last_may - timedelta(days=(last_may.weekday() - calendar.MONDAY) % 7)] = "Memorial Day"

    first_november = date(year, 11, 1)
    offset = (calendar.THURSDAY - first_november.weekday()) % 7
    holidays[first_november + timedelta(days=offset + 21)] = "Thanksgiving Day"

    observed = dict(holidays)
    for holiday_date, name in holidays.items():
        if holiday_date.weekday() == calendar.SATURDAY:
            observed[holiday_date - timedelta(days=1)] = f"{name} (Observed)"
        elif holiday_date.weekday() == calendar.SUNDAY:
            observed[holiday_date + timedelta(days=1)] = f"{name} (Observed)"
    return observed


def upcoming_holiday():
    today = date.today()
    print(f"Today's date: {today}")

    calendar = {**us_holidays(today.year), **us_holidays(today.year + 1)}
    upcoming = [
        (holiday_date, name)
        for holiday_date, name in calendar.items()
        if holiday_date > today
    ]

    holiday_date, holiday_name = min(upcoming)
    days_left = (holiday_date - today).days

    print(f"The next holiday is {holiday_name} in {days_left} days.")


upcoming_holiday()