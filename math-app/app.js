const _ = require('lodash');
const { add, multiply } = require('./math');

const value1 = add(10, 5);
const value2 = multiply(4, 6);
const numbers = [3, 6, 9, 12];

console.log('Addition result:', value1);
console.log('Multiplication result:', value2);
console.log('Lodash sum:', _.sum(numbers));
console.log('Lodash max:', _.max(numbers));
