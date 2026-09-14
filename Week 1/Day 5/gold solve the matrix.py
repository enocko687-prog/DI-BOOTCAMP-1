import re


MATRIX_STR = '''
7ir
Tsi
h%x
i ?
sM# 
$a 
#t%'''


def build_matrix(matrix_string):
	"""Convert the matrix string into a list of character rows."""
	rows = matrix_string.strip('\n').splitlines()
	width = max(len(row) for row in rows)
	return [list(row.ljust(width)) for row in rows]


def decode_matrix(matrix_string):
	"""Read the matrix by columns and replace symbol groups with spaces."""
	matrix = build_matrix(matrix_string)
	column_text = []

	for column_index in range(len(matrix[0])):
		column_text.extend(row[column_index] for row in matrix)

	decoded_message = ''.join(column_text)
	decoded_message = re.sub(r'[^A-Za-z]+', ' ', decoded_message)
	return decoded_message.strip()


if __name__ == '__main__':
	print(decode_matrix(MATRIX_STR))
