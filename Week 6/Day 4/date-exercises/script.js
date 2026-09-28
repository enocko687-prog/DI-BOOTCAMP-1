const { timeUntilNewYear, minutesLived, nextHolidayInfo } = require('./date');

console.log('Exercise 1:');
console.log('Time until January 1st:', timeUntilNewYear());

console.log('\nExercise 2:');
console.log('Minutes lived:', minutesLived('1995-05-10T00:00:00'));

console.log('\nExercise 3:');
const holidayInfo = nextHolidayInfo();
console.log('Today:', holidayInfo.today);
console.log('Next holiday:', holidayInfo.holidayName);
console.log('Time left:', holidayInfo.timeLeft);
