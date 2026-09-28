// Exercise 1: Time left until January 1st
function timeUntilNewYear() {
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
  const diffMs = nextYear - now;

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
}

// Exercise 2: Minutes the user has lived
function minutesLived(birthdate) {
  const birth = new Date(birthdate);
  const now = new Date();
  const diffMs = now - birth;
  return Math.floor(diffMs / (1000 * 60));
}

// Exercise 3: Next holiday countdown
function nextHolidayInfo() {
  const today = new Date();
  const holidayName = "New Year's Day";
  const holidayDate = new Date(today.getFullYear(), 0, 1, 0, 0, 0);
  const nextHolidayDate = holidayDate > today ? holidayDate : new Date(today.getFullYear() + 1, 0, 1, 0, 0, 0);

  const diffMs = nextHolidayDate - today;
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return {
    holidayName,
    timeLeft: `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`,
    today: today.toISOString()
  };
}

console.log('Exercise 1:');
console.log('Time until January 1st:', timeUntilNewYear());

console.log('\nExercise 2:');
console.log('Minutes lived:', minutesLived('1995-05-10T00:00:00'));

console.log('\nExercise 3:');
const holidayInfo = nextHolidayInfo();
console.log('Today:', holidayInfo.today);
console.log('Next holiday:', holidayInfo.holidayName);
console.log('Time left:', holidayInfo.timeLeft);
