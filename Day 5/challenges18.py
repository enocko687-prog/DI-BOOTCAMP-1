def type_count(**kwargs):
	counts = {"int": 0, "str": 0, "float": 0, "bool": 0}

	for value in kwargs.values():
		if type(value) is int:
			counts["int"] += 1
		elif type(value) is str:
			counts["str"] += 1
		elif type(value) is float:
			counts["float"] += 1
		elif type(value) is bool:
			counts["bool"] += 1

	return ", ".join(f"{name}: {count}" for name, count in counts.items())


print(type_count(a=1, b="string", c=1.0, d=True, e=False))
