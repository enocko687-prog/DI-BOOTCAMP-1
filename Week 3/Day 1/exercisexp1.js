const people = ["Greg", "Mary", "Devon", "James"];

// Part I - Review about arrays

// 1. Remove "Greg" from the array
people.shift();
console.log("After removing Greg:", people);

// 2. Replace "James" with "Jason"
people[people.indexOf("James")] = "Jason";
console.log("After replacing James with Jason:", people);

// 3. Add your name to the end of the array
const myName = "YourName";
people.push(myName);
console.log("After adding your name:", people);

// 4. Find Mary’s index
console.log("Mary index:", people.indexOf("Mary"));

// 5. Make a copy of the people array excluding Mary and your name
const peopleCopy = people.slice(1, 3);
console.log("People copy without Mary and your name:", peopleCopy);

// 6. Find index of "Foo"
console.log("Foo index:", people.indexOf("Foo"));
// It returns -1 because "Foo" is not present in the array.

// 7. Last element of the array
const last = people[people.length - 1];
console.log("Last element:", last);

// Part II - Loops

// 1. Iterate through the array and log each person
for (let i = 0; i < people.length; i++) {
  console.log(people[i]);
}

// 2. Iterate through the array and stop when reaching Devon
for (let i = 0; i < people.length; i++) {
  console.log(people[i]);
  if (people[i] === "Devon") {
    break;
  }
}
