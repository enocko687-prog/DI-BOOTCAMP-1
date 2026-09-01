const numbers = [5, 0, 9, 1, 7, 4, 2, 6, 3, 8];

// 1. Convert array to string using toString()
console.log(numbers.toString());

// 2. Convert array to string using join() with different separators
console.log(numbers.join("+"));
console.log(numbers.join(" "));
console.log(numbers.join(""));

// Bonus: sort in descending order using Bubble Sort with nested loops
for (let i = 0; i < numbers.length; i++) {
  for (let j = 0; j < numbers.length - 1 - i; j++) {
    if (numbers[j] < numbers[j + 1]) {
      // Swap the two values
      let temp = numbers[j];
      numbers[j] = numbers[j + 1];
      numbers[j + 1] = temp;
    }
    console.log(`Step ${i + 1}.${j + 1}: ${numbers.join(", ")}`);
  }
}

console.log("Final sorted array:", numbers);
