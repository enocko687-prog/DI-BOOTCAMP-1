const { format, addDays } = require('date-fns');

function showFormattedDate() {
  const now = new Date();
  const futureDate = addDays(now, 5);
  return format(futureDate, 'yyyy-MM-dd');
}

module.exports = { showFormattedDate };
