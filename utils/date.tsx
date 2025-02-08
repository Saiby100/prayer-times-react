
function getNextDay(current: Date) {
  const nextDay = new Date(current);

  nextDay.setDate(current.getDate() + 1);

  return nextDay;
}

function getPrevDay(current: Date) {
  const prevDay = new Date(current);

  prevDay.setDate(current.getDate() - 1);

  return prevDay;
}

function getNextMonth(current: Date) {
  const nextMonth = new Date(current);

  nextMonth.setDate(current.getMonth() + 1);

  if (nextMonth.getMonth() === 0) {
    nextMonth.setFullYear(current.getFullYear() + 1);
  }

  return nextMonth;
}

function getPrevMonth(current: Date) {
  const prevMonth = new Date(current);

  prevMonth.setDate(current.getMonth() - 1);

  if (prevMonth.getMonth() === 11) {
    prevMonth.setFullYear(current.getFullYear() - 1);
  }

  return prevMonth;
}

function dateToString(current: Date)  {
  return current.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export { getNextDay, getPrevDay, getNextMonth, getPrevMonth, dateToString };
