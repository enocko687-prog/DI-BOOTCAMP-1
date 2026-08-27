from datetime import datetime


def minutes_lived(birthdate):
    birth_date = datetime.strptime(birthdate, "%Y-%m-%d")
    now = datetime.now()

    if birth_date > now:
        raise ValueError("Birthdate cannot be in the future.")

    minutes = int((now - birth_date).total_seconds() // 60)
    print(f"You have lived approximately {minutes:,} minutes.")


minutes_lived("2000-01-01")