// Exercise 1: Random Number
const randomNumber = Math.floor(Math.random() * 100) + 1;
console.log('Random number:', randomNumber);

console.log('Even numbers from 0 to random number:');
for (let i = 0; i <= randomNumber; i++) {
  if (i % 2 === 0) {
    console.log(i);
  }
}

// Exercise 2: Capitalized letters
function capitalize(str) {
  const evenUpper = str
    .split('')
    .map((char, index) => (index % 2 === 0 ? char.toUpperCase() : char))
    .join('');

  const oddUpper = str
    .split('')
    .map((char, index) => (index % 2 !== 0 ? char.toUpperCase() : char))
    .join('');

  return [evenUpper, oddUpper];
}

console.log(capitalize('abcdef'));

// Exercise 3: Is palindrome?
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const reversed = cleaned.split('').reverse().join('');
  return cleaned === reversed;
}

console.log(isPalindrome('madam'));
console.log(isPalindrome('hello'));

// Exercise 4: Biggest Number
function biggestNumberInArray(arrayNumber) {
  if (!Array.isArray(arrayNumber) || arrayNumber.length === 0) {
    return 0;
  }

  const numbers = arrayNumber.filter((value) => typeof value === 'number' && !Number.isNaN(value));

  if (numbers.length === 0) {
    return 0;
  }

  return Math.max(...numbers);
}

const array = [-1, 0, 3, 100, 99, 2, 99];
const array2 = ['a', 3, 4, 2];
const array3 = [];

console.log(biggestNumberInArray(array));
console.log(biggestNumberInArray(array2));
console.log(biggestNumberInArray(array3));

// Exercise 5: Unique Elements
function uniqueElements(array) {
  return [...new Set(array)];
}

const list = [1, 2, 3, 3, 3, 3, 4, 5];
console.log(uniqueElements(list));

// Exercise 6: Calendar
function createCalendar(year, month) {
  const table = document.createElement('table');
  const headerRow = document.createElement('tr');
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  weekdays.forEach((day) => {
    const th = document.createElement('th');
    th.textContent = day;
    headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

  let currentDay = 1;
  let startDay = (firstDay.getDay() + 6) % 7;

  while (currentDay <= daysInMonth) {
    const row = document.createElement('tr');

    for (let i = 0; i < 7; i++) {
      const cell = document.createElement('td');

      if ((row.children.length === 0 && i < startDay) || currentDay > daysInMonth) {
        cell.textContent = '';
      } else {
        cell.textContent = currentDay;
        currentDay++;
      }

      row.appendChild(cell);
    }

    table.appendChild(row);
  }

  document.body.appendChild(table);
  return table;
}

createCalendar(2012, 9);
