// Utility to check if two objects have identical data
function isSameData(data /*instance */, newData) {
  //const data = instance.get(); // Extract plain object from Sequelize instance
  return Object.entries(newData).every(([key, value]) => data[key] === value);
}

module.exports = { isSameData };
