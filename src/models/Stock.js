import mongoose from 'mongoose';
import { roundTo } from '../utils/misc.js';

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    unique: true,
    required: true,
  },
  securityId: {
    type: String,
    unique: true,
    required: true,
  },
});

stockSchema.statics.setFields = function (stock, fields) {
  const { quantity, quote, accountId } = fields;
  stock.quote = Number(quote);
  stock.quantity = quantity ? quantity : 0;
  stock.amount = stock.quantity * stock.quote;
  stock.accountId = accountId ? accountId : 'N/A';
};

stockSchema.statics.getPercentage = function (stock, sumInPosition) {
  return {
    symbol: stock.symbol,
    quote: stock.quote,
    quantity: stock.quantity,
    amount: roundTo(stock.amount),
    percentage: roundTo((stock.amount / sumInPosition) * 100) + '%',
  };
};

stockSchema.statics.rebalance = function (stock, totalSum, percentage) {
  let amount = totalSum * percentage;
  const finalQuantity = Math.floor(amount / stock.quote);
  amount = finalQuantity * stock.quote;
  return {
    symbol: stock.symbol,
    securityId: stock.securityId,
    quote: stock.quote,
    quantity: {
      current: stock.quantity,
      change: finalQuantity - stock.quantity,
      final: finalQuantity,
    },
    amount: {
      current: roundTo(stock.amount),
      final: roundTo(amount),
    },
    percentage: {
      preferred: roundTo(percentage * 100) + '%',
      final: roundTo((amount / totalSum) * 100) + '%',
    },
  };
};

export default mongoose.model('Stock', stockSchema);
