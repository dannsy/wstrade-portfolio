import User from '../models/User.js';
import Stock from '../models/Stock.js';
import { getPositions, getSecurityQuery, getSecurityById } from '../services/wstrade-wrapper/wstrade-caller.js';
import { roundTo, sumAvailableToTrade } from '../utils/misc.js';
import NotFoundError from '../errors/NotFound.error.js';
import InvalidAllocationError from '../errors/InvalidAllocation.error.js';

async function getPositionsInfo(accessToken) {
  const positions = await getPositions(accessToken);

  let sum = 0;
  const stocksIndexMap = new Map();
  const stocks = await Promise.all(
    positions.map(async (position, index) => {
      const symbol = position.stock.symbol;
      const securityId = position.id;
      const stock = await Stock.findOneAndUpdate({ symbol }, { symbol, securityId }, { upsert: true, new: true })
        .lean()
        .exec();

      const amount = position.quantity * position.quote.last;
      sum += amount;
      stocksIndexMap.set(symbol, index);

      // TODO: use static functions to set these temporary fields
      stock.quantity = position.quantity;
      stock.quote = Number(position.quote.last);
      stock.amount = amount;
      stock.accountId = position.account_id;
      return stock;
    })
  );

  return { sum, stocks, stocksIndexMap };
}

export async function getPortfolio(req, res) {
  const { email } = req.headers;

  const user = await User.findOne({ email }).exec();
  if (!user) throw new NotFoundError('User');
  const { accessToken } = await user.getTokens();

  const positionsInfo = await getPositionsInfo(accessToken);
  let { sum, stocks } = positionsInfo;
  stocks = stocks.map((stock) => {
    return {
      symbol: stock.symbol,
      quantity: stock.quantity,
      quote: stock.quote,
      amount: roundTo(stock.amount),
      percentage: roundTo((stock.amount / sum) * 100) + '%',
    };
  });

  const availableToTrade = sumAvailableToTrade(user.accounts);
  const portfolio = {
    inPosition: sum,
    availableToTrade: availableToTrade,
    totalSum: sum + availableToTrade,
    stocks: stocks,
  };
  res.send(portfolio);
}

export async function getRebalancedPortfolio(req, res) {
  const { email } = req.headers;

  const user = await User.findOne({ email }).populate('allocation.stock').exec();
  if (!user) throw new NotFoundError('User');
  const { accessToken } = await user.getTokens();

  const positionsInfo = await getPositionsInfo(accessToken);
  let { sum, stocks: heldStocks, stocksIndexMap } = positionsInfo;
  const availableToTrade = sumAvailableToTrade(user.accounts);
  const totalSum = sum + availableToTrade;

  let newSum = 0;
  const rebalancedStocks = [];
  // TODO: use map instead
  for (const asset of user.allocation) {
    let stockInfo;
    if (stocksIndexMap.has(asset.stock.symbol)) {
      stockInfo = heldStocks[stocksIndexMap.get(asset.stock.symbol)];
    } else {
      const security = await getSecurityById(accessToken, asset.stock.securityId);
      stockInfo = {
        symbol: security.stock.symbol,
        securityId: security.id,
        quantity: 0,
        quote: Number(security.quote.last),
        amount: 0,
        accountId: 'N/A',
      };
    }

    const amount = totalSum * asset.percentage;
    const requiredQuantity = Math.floor(amount / stockInfo.quote);
    const finalAmount = requiredQuantity * stockInfo.quote;
    newSum += finalAmount;
    // TODO: create function for constructing stock object, maybe store to db even
    rebalancedStocks.push({
      symbol: stockInfo.symbol,
      securityId: stockInfo.securityId,
      requiredQuantity: requiredQuantity,
      currentQuantity: stockInfo.quantity,
      changeInQuantity: requiredQuantity - stockInfo.quantity,
      quote: stockInfo.quote,
      finalAmount: roundTo(finalAmount),
      currentAmount: roundTo(stockInfo.amount),
      percentage: roundTo((finalAmount / totalSum) * 100) + '%',
      preferredPercentage: roundTo(asset.percentage * 100) + '%',
    });
  }

  const toSell = heldStocks
    .filter((stock) => !user.allocation.some((asset) => asset.stock.symbol === stock.symbol))
    .map((stock) => stock.symbol);
  for (const symbol of toSell) {
    const stockInfo = heldStocks[stocksIndexMap.get(symbol)];
    rebalancedStocks.push({
      symbol: symbol,
      securityId: stockInfo.securityId,
      requiredQuantity: 0,
      currentQuantity: stockInfo.quantity,
      changeInQuantity: -stockInfo.quantity,
      quote: stockInfo.quote,
      finalAmount: 0,
      currentAmount: roundTo(stockInfo.amount),
      percentage: '0%',
      preferredPercentage: '0%',
    });
  }

  const portfolio = {
    inPosition: newSum,
    availableToTrade: totalSum - newSum,
    totalSum: totalSum,
    stocks: rebalancedStocks,
  };
  res.send(portfolio);
}

export async function postAllocation(req, res) {
  const { email } = req.headers;
  const { allocation } = req.body;

  // Ensure that sum of stock allocation is 100%
  let percentageSum = allocation.reduce((prev, curr) => prev + curr.percentage, 0);
  percentageSum = roundTo(percentageSum, 4);
  if (percentageSum !== 1) throw new InvalidAllocationError();

  const user = await User.findOne({ email }).exec();
  if (!user) throw new NotFoundError('User');
  const { accessToken } = await user.getTokens();

  user.allocation = await Promise.all(
    allocation.map(async (asset) => {
      let stock = await Stock.findOne({ symbol: asset.symbol }).exec();
      if (!stock) {
        const securityQuery = await getSecurityQuery(accessToken, asset.symbol);
        const metaInfo = securityQuery.results.filter((info) => asset.symbol === info.stock.symbol);
        if (metaInfo.length !== 1) throw new NotFoundError('Stock');

        stock = new Stock({ symbol: asset.symbol, securityId: metaInfo[0].id });
        await stock.save();
      }
      return { stock: stock._id, percentage: asset.percentage };
    })
  );
  await user.save();

  res.send({ message: 'Allocation saved' });
}
