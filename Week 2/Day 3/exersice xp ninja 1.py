from abc import ABC, abstractmethod


class Temperature(ABC):
    def __init__(self, value):
        self.value = value

    @abstractmethod
    def to_celsius(self):
        """Return the temperature in Celsius."""
        raise NotImplementedError

    def to_kelvin(self):
        return Kelvin(self.to_celsius().value + 273.15)

    def to_fahrenheit(self):
        return Fahrenheit(self.to_celsius().value * 9 / 5 + 32)

    def __str__(self):
        return f"{self.value:.2f}°"


class Celsius(Temperature):
    def to_celsius(self):
        return Celsius(self.value)


class Kelvin(Temperature):
    def to_celsius(self):
        return Celsius(self.value - 273.15)


class Fahrenheit(Temperature):
    def to_celsius(self):
        return Celsius((self.value - 32) * 5 / 9)


temperature = Celsius(25)

print(temperature.to_fahrenheit().value)  # 77.0
print(temperature.to_kelvin().value)      # 298.15
print(Fahrenheit(77).to_celsius().value)  # 25.0