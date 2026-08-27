import time


class GameOfLife:
    def __init__(self, grid):
        self.grid = grid
        self.rows = len(grid)
        self.columns = len(grid[0])

    def display(self, generation):
        print(f"\nGeneration {generation}")
        for row in self.grid:
            print(" ".join("■" if cell else "." for cell in row))

    def count_neighbors(self, row, column):
        neighbors = 0

        for row_change in (-1, 0, 1):
            for column_change in (-1, 0, 1):
                if row_change == 0 and column_change == 0:
                    continue

                neighbor_row = row + row_change
                neighbor_column = column + column_change

                if (
                    0 <= neighbor_row < self.rows
                    and 0 <= neighbor_column < self.columns
                ):
                    neighbors += self.grid[neighbor_row][neighbor_column]

        return neighbors

    def next_generation(self):
        new_grid = []

        for row in range(self.rows):
            new_row = []

            for column in range(self.columns):
                alive_neighbors = self.count_neighbors(row, column)
                is_alive = self.grid[row][column]

                if is_alive and alive_neighbors in (2, 3):
                    new_row.append(1)
                elif not is_alive and alive_neighbors == 3:
                    new_row.append(1)
                else:
                    new_row.append(0)

            new_grid.append(new_row)

        self.grid = new_grid

    def run(self, generations, delay=0.3):
        for generation in range(generations + 1):
            self.display(generation)

            if generation < generations:
                self.next_generation()
                time.sleep(delay)


# 0 = dead cell, 1 = live cell
initial_grid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

game = GameOfLife(initial_grid)
game.run(generations=20)