const createError = require("http-errors");

// Utility to check if two objects have identical data
function isSameData(data /*instance */, newData) {
  //const data = instance.get(); // Extract plain object from Sequelize instance
  return Object.entries(newData).every(([key, value]) => data[key] === value);
}

function checkDateRange(date, startDate, endDate) {
  const showDate = new Date(date);
  const rangeStart = new Date(startDate);
  const rangeEnd = new Date(endDate);

  if (showDate < rangeStart || showDate > rangeEnd) {
    throw createError(400, `Show date (${date}) must be between ${startDate} and ${endDate}`);
  }
}

module.exports = { isSameData, checkDateRange };
