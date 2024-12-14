const createError = require("http-errors");

// Utility to check if two objects have identical data
function isSameData(instance, newData) {
  const data = instance;

  return Object.keys(newData).every((key) => {
    const currentValue = data[key];
    const newValue = newData[key];
    // Normalize values
    const normalizedCurrent = isNaN(currentValue)
      ? currentValue
      : parseFloat(currentValue);
    const normalizedNew = isNaN(newValue) ? newValue : parseFloat(newValue);
    return normalizedCurrent === normalizedNew;
  });
}

// Utility to check that show date is not outside of tour dates
function checkDateRange(date, startDate, endDate) {
  const showDate = new Date(date);
  const rangeStart = new Date(startDate);
  const rangeEnd = new Date(endDate);

  if (showDate < rangeStart || showDate > rangeEnd) {
    throw createError(
      400,
      `Show date (${date}) must be between ${startDate} and ${endDate}`
    );
  }
}

// Utility to compare start and end quantities
function checkQuantities(start, end) {
  if (end && end > start) {
    throw createError(400, "End inventory cannot be more than start inventory");
  }
}

module.exports = { isSameData, checkDateRange, checkQuantities };
