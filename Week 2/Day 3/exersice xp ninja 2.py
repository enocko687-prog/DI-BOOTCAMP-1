import random


class QuantumParticle:
    def __init__(self, x=None, p=None):
        self._position = x if x is not None else random.randint(1, 10_000)
        self._momentum = p if p is not None else random.random()
        self._spin = random.choice((0.5, -0.5))
        self.entangled_particle = None

    def disturb(self):
        self._position = random.randint(1, 10_000)
        self._momentum = random.random()
        print("Quantum Interferences!!")

    def position(self):
        self.disturb()
        return self._position

    def momentum(self):
        self.disturb()
        return self._momentum

    def spin(self):
        self._spin = random.choice((0.5, -0.5))
        self.disturb()

        if self.entangled_particle is not None:
            self.entangled_particle._spin = -self._spin

        return self._spin

    def entangle(self, other_particle):
        if not isinstance(other_particle, QuantumParticle):
            raise TypeError("A particle can only be entangled with another particle.")

        self.entangled_particle = other_particle
        other_particle.entangled_particle = self

        print("Spooky Action at a Distance !!")

    def __repr__(self):
        return (
            f"QuantumParticle(position={self._position}, "
            f"momentum={self._momentum:.3f}, spin={self._spin})"
        )


p1 = QuantumParticle(x=1, p=5.0)
p2 = QuantumParticle(x=2, p=5.0)

p1.entangle(p2)

print(p1)
print("Particle 1 spin:", p1.spin())
print("Particle 2 spin:", p2._spin)