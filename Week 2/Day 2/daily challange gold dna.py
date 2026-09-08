import random


class Gene:
    def __init__(self, value=None):
        self.value = random.randint(0, 1) if value is None else value

    def mutate(self):
        self.value = 1 - self.value


class Chromosome:
    def __init__(self):
        self.genes = [Gene() for _ in range(10)]

    def mutate(self):
        amount = random.randint(1, len(self.genes))
        selected_genes = random.sample(self.genes, amount)

        for gene in selected_genes:
            if random.choice([True, False]):
                gene.mutate()

    def is_all_ones(self):
        return all(gene.value == 1 for gene in self.genes)


class DNA:
    def __init__(self):
        self.chromosomes = [Chromosome() for _ in range(10)]

    def mutate(self):
        amount = random.randint(1, len(self.chromosomes))
        selected_chromosomes = random.sample(self.chromosomes, amount)

        for chromosome in selected_chromosomes:
            chromosome.mutate()

    def is_all_ones(self):
        return all(
            chromosome.is_all_ones()
            for chromosome in self.chromosomes
        )


class Organism:
    def __init__(self, dna, environment):
        self.dna = dna
        self.environment = environment

    def mutate(self):
        if random.random() < self.environment:
            self.dna.mutate()


organisms = [
    Organism(DNA(), environment=0.1)
    for _ in range(100)
]

generation = 0
max_generations = 100_000

while generation < max_generations:
    generation += 1

    for organism in organisms:
        organism.mutate()

        if organism.dna.is_all_ones():
            print(f"Organism reached all ones after {generation} generations.")
            raise SystemExit

print("No organism reached an all-ones DNA sequence.")