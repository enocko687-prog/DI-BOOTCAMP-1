import math


class Circle:
    def __init__(self, radius):
        if radius <= 0:
            raise ValueError("Radius must be positive.")
        self.radius = radius

    @classmethod
    def from_diameter(cls, diameter):
        return cls(diameter / 2)

    @property
    def diameter(self):
        return self.radius * 2

    @diameter.setter
    def diameter(self, value):
        if value <= 0:
            raise ValueError("Diameter must be positive.")
        self.radius = value / 2

    def area(self):
        return math.pi * self.radius ** 2

    def __str__(self):
        return f"Circle(radius={self.radius}, diameter={self.diameter})"

    def __add__(self, other):
        if not isinstance(other, Circle):
            return NotImplemented
        return Circle(self.radius + other.radius)

    def __gt__(self, other):
        if not isinstance(other, Circle):
            return NotImplemented
        return self.radius > other.radius

    def __eq__(self, other):
        if not isinstance(other, Circle):
            return NotImplemented
        return self.radius == other.radius

    def __lt__(self, other):
        if not isinstance(other, Circle):
            return NotImplemented
        return self.radius < other.radius


circle1 = Circle(5)
circle2 = Circle.from_diameter(8)
circle3 = Circle(3)

print(circle1)
print(f"Area: {circle1.area():.2f}")
print(f"Diameter: {circle2.diameter}")
print(f"Circle 1 is bigger: {circle1 > circle2}")
print(f"Circles are equal: {circle1 == circle3}")

circle_sum = circle1 + circle2
print(f"Added circle: {circle_sum}")

circles = [circle1, circle2, circle3]
for circle in sorted(circles):
    print(circle)
    Circle(radius=2.0, diameter=4.0)
Circle(radius=3, diameter=6)
Circle(radius=5, diameter=10)