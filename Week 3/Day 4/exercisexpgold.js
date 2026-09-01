// Exercise 1: Nested functions
/*
Prediction before execution:
- The outer function landscape creates an empty string result.
- flat(x) adds x underscores to result.
- mountain(x) adds '/' + x apostrophes + '\\'.
- flat(4) adds "____".
- mountain(4) adds "/''''\\".
- flat(4) adds another "____".
- Final result: "____/''''\\____"

This is because all inner functions share the same outer variable result, and the function executes in order.
*/

const landscape = () => {
  let result = "";

  const flat = (x) => {
    for (let count = 0; count < x; count++) {
      result += "_";
    }
  };

  const mountain = (x) => {
    result += "/";
    for (let counter = 0; counter < x; counter++) {
      result += "'";
    }
    result += "\\";
  };

  flat(4);
  mountain(4);
  flat(4);

  return result;
};

console.log(landscape());

// Exercise 2: Closure
/*
const addTo = x => y => x + y;
const addToTen = addTo(10);
addToTen(3);

Prediction: 13
Because addTo(10) returns a function that remembers x = 10 through closure, and then adds y = 3.
*/

const addTo = (x) => (y) => x + y;
const addToTen = addTo(10);
console.log(addToTen(3));

// Exercise 3: Currying
/*
const curriedSum = (a) => (b) => a + b
curriedSum(30)(1)

Prediction: 31
Because the first call sets a = 30, and the returned function adds b = 1.
*/

const curriedSum = (a) => (b) => a + b;
console.log(curriedSum(30)(1));

// Exercise 4: Currying
/*
const curriedSum = (a) => (b) => a + b
const add5 = curriedSum(5)
add5(12)

Prediction: 17
Because add5 is a function that adds 5 to its argument.
*/

const curriedSum2 = (a) => (b) => a + b;
const add5 = curriedSum2(5);
console.log(add5(12));

// Exercise 5: Composing
/*
const compose = (f, g) => (a) => f(g(a));
const add1 = (num) => num + 1;
const add5 = (num) => num + 5;
compose(add1, add5)(10)

Prediction: 16
Because g(10) = 15, then f(15) = 16.
*/

const compose = (f, g) => (a) => f(g(a));
const add1 = (num) => num + 1;
const addFive = (num) => num + 5;
console.log(compose(add1, addFive)(10));
