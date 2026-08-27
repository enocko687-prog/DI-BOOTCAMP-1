def sum_over_k(sentence, k):
	word_count = 0
	for word in sentence.split():
		if len(word) > k:
			word_count += 1
	return word_count


sentence = "Do or do not there is no try"
k = 2
print(sum_over_k(sentence, k))
