const calculateAdjustments = (adjustments) => {
  const totals = adjustments.reduce(
    (acc, adj) => {
      if (adj.type === "restock") acc.restock += adj.quantity;
      if (adj.type === "giveaway") acc.giveaway += adj.quantity;
      if (adj.type === "loss") acc.loss += adj.quantity;
      return acc;
    },
    { restock: 0, giveaway: 0, loss: 0 }
  );

  return totals.restock - (totals.giveaway + totals.loss);
};

module.exports = calculateAdjustments;
