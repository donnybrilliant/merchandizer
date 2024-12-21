const processAdjustments = (adjustments, price = 0) => {
  const totals = {
    restock: 0,
    giveaway: 0,
    loss: 0,
    discount: 0,
    totalDiscount: 0,
  };

  for (const adj of adjustments) {
    totals[adj.type] += adj.quantity;

    if (adj.type === "discount") {
      if (adj.discountType === "percentage") {
        const discountPerUnit = price * (adj.discountValue / 100);
        totals.totalDiscount += discountPerUnit * adj.quantity;
      } else if (adj.discountType === "fixed") {
        totals.totalDiscount += parseFloat(adj.discountValue) * adj.quantity;
      }
    }
  }

  return totals;
};

const calculateAdjustments = (adjustments) => {
  const { restock, giveaway, loss } = processAdjustments(adjustments);
  return restock - (giveaway + loss);
};

const summarizeAdjustments = (adjustments, price) => {
  const totals = processAdjustments(adjustments, price);
  return {
    restock: totals.restock,
    giveaway: totals.giveaway,
    loss: totals.loss,
    discount: totals.discount,
    totalDiscount: parseFloat(totals.totalDiscount.toFixed(2)),
  };
};

module.exports = { calculateAdjustments, summarizeAdjustments };
