def display_board(board):
	print("\n    1   2   3")
	for row_index, row in enumerate(board, start=1):
		print(f"{row_index}   {row[0]} | {row[1]} | {row[2]}")
		if row_index < 3:
			print("   ---+---+---")
	print()


def player_input(board, player):
	while True:
		move = input(f"Player {player}, enter row and column (1-3 1-3): ").split()

		if len(move) != 2 or not all(value.isdigit() for value in move):
			print("Please enter two numbers, such as 2 3.")
			continue

		row, column = (int(value) - 1 for value in move)
		if not 0 <= row < 3 or not 0 <= column < 3:
			print("Rows and columns must be between 1 and 3.")
			continue

		if board[row][column] != " ":
			print("That position is already taken.")
			continue

		return row, column


def check_win(board, player):
	winning_lines = [
		*board,
		[board[row][column] for row in range(3) for column in [0]],
		[board[row][column] for row in range(3) for column in [1]],
		[board[row][column] for row in range(3) for column in [2]],
		[board[index][index] for index in range(3)],
		[board[index][2 - index] for index in range(3)],
	]
	return any(line == [player] * 3 for line in winning_lines)


def board_is_full(board):
	return all(cell != " " for row in board for cell in row)


def play():
	board = [[" " for _ in range(3)] for _ in range(3)]
	player = "X"

	while True:
		display_board(board)
		row, column = player_input(board, player)
		board[row][column] = player

		if check_win(board, player):
			display_board(board)
			print(f"Player {player} wins!")
			break

		if board_is_full(board):
			display_board(board)
			print("It's a tie!")
			break

		player = "O" if player == "X" else "X"


if __name__ == "__main__":
	play()
  