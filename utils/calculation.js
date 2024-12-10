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

function summarizeAdjustments(adjustments, price) {
  let restock = 0;
  let giveaway = 0;
  let loss = 0;
  let discount = 0;
  let totalDiscount = 0;

  for (const adj of adjustments) {
    if (adj.type === "restock") {
      restock += adj.quantity;
    } else if (adj.type === "giveaway") {
      giveaway += adj.quantity;
    } else if (adj.type === "loss") {
      loss += adj.quantity;
    } else if (adj.type === "discount") {
      discount += adj.quantity;
      // Calculate discount amount
      if (adj.discountType === "percentage") {
        const discountPerUnit = price * (adj.discountValue / 100);
        totalDiscount += discountPerUnit * adj.quantity;
      } else if (adj.discountType === "fixed") {
        totalDiscount += parseFloat(adj.discountValue) * adj.quantity;
      }
    }
  }

  return { restock, giveaway, loss, discount, totalDiscount };
}

module.exports = { calculateAdjustments, summarizeAdjustments };
