from datetime import datetime


def time_until_new_year():
    now = datetime.now()
    next_year = now.year + 1
    january_first = datetime(next_year, 1, 1)

    time_left = january_first - now
    print(f"Time left until January 1st: {time_left}")


time_until_new_year()