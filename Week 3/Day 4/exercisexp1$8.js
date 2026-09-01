// Exercise 1: Scope
/*
#1
function funcOne() {
    let a = 5;
    if(a > 1) {
        a = 3;
    }
    alert(`inside the funcOne function ${a}`);
}

Prediction: a is 3 inside funcOne because the variable is declared in the function scope and reassigned inside the if block.
If declared with const instead of let, it would throw a TypeError because const cannot be reassigned after initialization.

#2
let a = 0;
function funcTwo() { a = 5; }
function funcThree() { alert(`inside the funcThree function ${a}`); }

Prediction: funcThree() first alerts 0, then funcTwo() changes global a to 5, then funcThree() alerts 5.
If a were declared with const, the assignment a = 5 would fail because const cannot be reassigned.

#3
function funcFour() {
    window.a = "hello";
}
function funcFive() {
    alert(`inside the funcFive function ${a}`);
}

Prediction: funcFour() creates a global variable a on the window object, so funcFive() alerts "hello".
If a were declared with const in the global scope, it would not be assigned via window.a in the same way, and the global lookup would behave differently or fail.

#4
let a = 1;
function funcSix() {
    let a = "test";
    alert(`inside the funcSix function ${a}`);
}

Prediction: funcSix() alerts "test" because it shadows the global a with a local a.
If it were const instead of let, the behavior would stay the same because it is still a block-scoped local variable that is not reassigned.

#5
let a = 2;
if (true) {
    let a = 5;
    alert(`in the if block ${a}`);
}
alert(`outside of the if block ${a}`);

Prediction: the first alert shows 5 inside the block, and the second shows 2 outside the block.
This is because let creates block-scoped variables.
If declared with const instead of let inside the block, the result would remain the same, as it is not reassigned and is also block-scoped.
*/

// Exercise 2: Ternary operator
const winBattle = () => true;
const experiencePoints = winBattle() ? 10 : 1;
console.log(experiencePoints);

// Exercise 3: Is it a string?
const isString = (value) => typeof value === 'string';
console.log(isString('hello'));
console.log(isString([1, 2, 4, 0]));

// Exercise 4: Find the sum
const sum = (a, b) => a + b;
console.log(sum(3, 5));

// Exercise 5: Kg and grams
function convertKgToGramsDeclaration(kg) {
  return kg * 1000;
}
console.log(convertKgToGramsDeclaration(2));

const convertKgToGramsExpression = function (kg) {
  return kg * 1000;
};
console.log(convertKgToGramsExpression(2));
// Difference: function declarations are hoisted and accessible before their definition, while function expressions are not hoisted the same way and must be defined before use.

const convertKgToGramsArrow = (kg) => kg * 1000;
console.log(convertKgToGramsArrow(2));

// Exercise 6: Fortune teller
(function fortuneTeller(numChildren, partnerName, geoLocation, jobTitle) {
  const fortune = `You will be a ${jobTitle} in ${geoLocation}, and married to ${partnerName} with ${numChildren} kids.`;
  const result = document.createElement('div');
  result.textContent = fortune;
  document.body.appendChild(result);
})(2, 'Alice', 'Paris', 'Developer');

// Exercise 7: Welcome
(function welcomeUser(name) {
  const navbar = document.querySelector('nav') || document.createElement('nav');
  const userDiv = document.createElement('div');
  const img = document.createElement('img');

  img.src = 'https://via.placeholder.com/40';
  img.alt = 'profile';
  userDiv.textContent = name;
  userDiv.appendChild(img);

  navbar.appendChild(userDiv);
  document.body.insertBefore(navbar, document.body.firstChild);
})('John');

// Exercise 8: Juice Bar
function makeJuice(size) {
  const ingredients = [];

  function addIngredients(ingredient1, ingredient2, ingredient3) {
    ingredients.push(ingredient1, ingredient2, ingredient3);
  }

  function displayJuice() {
    const juiceText = `The client wants a ${size} juice, containing ${ingredients[0]}, ${ingredients[1]}, ${ingredients[2]}, ${ingredients[3]}, ${ingredients[4]}, ${ingredients[5]}.`;
    const result = document.createElement('div');
    result.textContent = juiceText;
    document.body.appendChild(result);
  }

  addIngredients('orange', 'banana', 'mango');
  addIngredients('strawberry', 'kiwi', 'apple');
  displayJuice();
}

makeJuice('large');
