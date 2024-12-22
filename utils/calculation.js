// Process adjustments for a single inventory item
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

// Process a single inventory item
const processInventory = (inventory, adjustments) => {
  const price = parseFloat(inventory.Product.price);
  const { restock, giveaway, loss, discount, totalDiscount } =
    summarizeAdjustments(adjustments, price);

  const endInventory = parseFloat(inventory.endInventory);
  const startInventory = parseFloat(inventory.startInventory);
  const netAdjustment = calculateAdjustments(adjustments);
  const adjustedStart = startInventory + netAdjustment;
  const sold = adjustedStart - endInventory;

  const revenue = sold * price;
  const netRevenue = revenue - totalDiscount;

  return {
    id: inventory.productId,
    name: inventory.Product.name,
    size: inventory.Product.size,
    color: inventory.Product.color,
    price: inventory.Product.price,
    startInventory,
    endInventory,
    sold,
    adjustments: { restock, giveaway, loss, discount },
    revenue: parseFloat(revenue.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    netRevenue: parseFloat(netRevenue.toFixed(2)),
  };
};

// Aggregate stats for multiple products
const mergeStats = (statsArray) => {
  return statsArray.reduce(
    (acc, stat) => {
      acc.sold += stat.sold;
      acc.revenue += stat.revenue;
      acc.totalDiscount += stat.totalDiscount;
      acc.netRevenue += stat.netRevenue;
      acc.adjustments.restock += stat.adjustments.restock;
      acc.adjustments.giveaway += stat.adjustments.giveaway;
      acc.adjustments.loss += stat.adjustments.loss;
      acc.adjustments.discount += stat.adjustments.discount;
      return acc;
    },
    {
      sold: 0,
      revenue: 0,
      totalDiscount: 0,
      netRevenue: 0,
      adjustments: { restock: 0, giveaway: 0, loss: 0, discount: 0 },
    }
  );
};

// Format totals for consistent output
const formatTotals = (totals) => {
  return {
    sold: totals.sold,
    revenue: parseFloat(totals.revenue.toFixed(2)),
    totalDiscount: parseFloat(totals.totalDiscount.toFixed(2)),
    netRevenue: parseFloat(totals.netRevenue.toFixed(2)),
    adjustments: totals.adjustments,
  };
};

module.exports = {
  calculateAdjustments,
  summarizeAdjustments,
  processInventory,
  mergeStats,
  formatTotals,
};
