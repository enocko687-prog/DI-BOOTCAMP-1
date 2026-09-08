from datetime import date, timedelta


def us_holidays(year):
    """Return common US federal holidays for a year without external packages."""
    def observed(day):
        if day.weekday() == 5:
            return day - timedelta(days=1)
        if day.weekday() == 6:
            return day + timedelta(days=1)
        return day

    def nth_weekday(month, weekday, occurrence):
        day = date(year, month, 1)
        return day + timedelta(days=(weekday - day.weekday()) % 7 + 7 * (occurrence - 1))

    def last_weekday(month, weekday):
        day = date(year, month + 1, 1) - timedelta(days=1) if month < 12 else date(year, 12, 31)
        return day - timedelta(days=(day.weekday() - weekday) % 7)

    holidays = {
        observed(date(year, 1, 1)): "New Year's Day",
        nth_weekday(1, 0, 3): "Martin Luther King Jr. Day",
        nth_weekday(2, 0, 3): "Washington's Birthday",
        last_weekday(5, 0): "Memorial Day",
        observed(date(year, 6, 19)): "Juneteenth National Independence Day",
        observed(date(year, 7, 4)): "Independence Day",
        nth_weekday(9, 0, 1): "Labor Day",
        nth_weekday(10, 0, 2): "Columbus Day",
        observed(date(year, 11, 11)): "Veterans Day",
        nth_weekday(11, 3, 4): "Thanksgiving Day",
        observed(date(year, 12, 25)): "Christmas Day",
    }
    return holidays


def upcoming_holiday():
    today = date.today()
    print(f"Today's date: {today}")

    calendar = {
        **us_holidays(today.year),
        **us_holidays(today.year + 1),
    }

    upcoming = [
        (holiday_date, name)
        for holiday_date, name in calendar.items()
        if holiday_date > today
    ]

    holiday_date, holiday_name = min(upcoming)
    days_left = (holiday_date - today).days

    print(f"The next holiday is {holiday_name} in {days_left} days.")


upcoming_holiday()