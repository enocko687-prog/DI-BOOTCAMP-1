student_grades = {
	"Alice": [88, 92, 100],
	"Bob": [75, 78, 80],
	"Charlie": [92, 90, 85],
	"Dana": [83, 88, 92],
	"Eli": [78, 80, 72],
}

student_averages = {}
student_letter_grades = {}

for student, grades in student_grades.items():
	average = sum(grades) / len(grades)
	student_averages[student] = average

	if average >= 90:
		student_letter_grades[student] = "A"
	elif average >= 80:
		student_letter_grades[student] = "B"
	elif average >= 70:
		student_letter_grades[student] = "C"
	elif average >= 60:
		student_letter_grades[student] = "D"
	else:
		student_letter_grades[student] = "F"

class_average = sum(student_averages.values()) / len(student_averages)

print(f"Class average: {class_average:.2f}")
for student in student_grades:
	print(
		f"{student}: average = {student_averages[student]:.2f}, "
		f"letter grade = {student_letter_grades[student]}"
	)
