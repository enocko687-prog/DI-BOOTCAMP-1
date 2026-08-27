import json


sample_json = """{
    "company": {
        "employee": {
            "name": "emma",
            "payable": {
                "salary": 7000,
                "bonus": 800
            }
        }
    }
}"""

data = json.loads(sample_json)

salary = data["company"]["employee"]["payable"]["salary"]
print("Salary:", salary)

data["company"]["employee"]["birth_date"] = "2000-01-01"

with open("modified_employee.json", "w", encoding="utf-8") as file:
    json.dump(data, file, indent=4)

print("Modified JSON saved successfully.")