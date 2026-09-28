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

function minutesLived(birthdate) {
  const birth = new Date(birthdate);
  const now = new Date();
  const diffMs = now - birth;
  return Math.floor(diffMs / (1000 * 60));
}

function nextHolidayInfo() {
  const today = new Date();
  const holidayName = 'New Year\'s Day';
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

module.exports = {
  timeUntilNewYear,
  minutesLived,
  nextHolidayInfo
};
