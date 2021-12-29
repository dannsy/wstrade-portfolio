import User from '../models/User.js';
import Stock from '../models/Stock.js';
import { getPositions, getSecurityQuery, getSecurityById } from '../services/wstrade-wrapper/wstrade-caller.js';
import { roundTo } from '../utils/misc.js';
import NotFoundError from '../errors/NotFound.error.js';
import InvalidAllocationError from '../errors/InvalidAllocation.error.js';

async function getPositionsInfo(accessToken) {
  const positions = await getPositions(accessToken);

  let sumInPosition = 0;
  const stocksIndexMap = new Map();
  const stocks = await Promise.all(
    positions.map(async (position, index) => {
      const symbol = position.stock.symbol;
      const securityId = position.id;
      const stock = await Stock.findOneAndUpdate({ symbol }, { symbol, securityId }, { upsert: true, new: true })
        .lean()
        .exec();

      Stock.setFields(stock, {
        quantity: position.quantity,
        quote: position.quote.last,
        accountId: position.account_id,
      });
      sumInPosition += stock.amount;

      stocksIndexMap.set(symbol, index);
      return stock;
    })
  );

  return { sumInPosition, stocks, stocksIndexMap };
}

export async function getPortfolio(req, res) {
  const { email } = req.headers;

  const user = await User.findOne({ email }).exec();
  if (!user) throw new NotFoundError('User');
  const { accessToken } = await user.getTokens();

  let { sumInPosition, stocks } = await getPositionsInfo(accessToken);
  stocks = stocks.map((stock) => Stock.getPercentage(stock, sumInPosition));

  const availableToTrade = user.sumAvailableToTrade();
  const portfolio = {
    sumInPosition: sumInPosition,
    availableToTrade: availableToTrade,
    totalSum: sumInPosition + availableToTrade,
    stocks: stocks,
  };
  res.send(portfolio);
}

export async function getRebalancedPortfolio(req, res) {
  const { email } = req.headers;

  const user = await User.findOne({ email }).populate('allocation.stock').exec();
  if (!user) throw new NotFoundError('User');
  const { accessToken } = await user.getTokens();

  let { sumInPosition, stocks: heldStocks, stocksIndexMap } = await getPositionsInfo(accessToken);
  const totalSum = sumInPosition + user.sumAvailableToTrade();

  // Calculate needed trades to achieve user preferred allocation
  let newSumInPosition = 0;
  let rebalancedStocks = await Promise.all(
    user.allocation.map(async (asset) => {
      let stock;
      if (stocksIndexMap.has(asset.stock.symbol)) {
        stock = heldStocks[stocksIndexMap.get(asset.stock.symbol)];
      } else {
        const security = await getSecurityById(accessToken, asset.stock.securityId);
        stock = asset.stock.toObject();
        Stock.setFields(stock, { quote: security.quote.last });
      }

      stock = Stock.rebalance(stock, totalSum, asset.percentage);
      newSumInPosition += stock.amount.final;
      return stock;
    })
  );

  // Find which stocks need to be sold entirely
  const toSell = heldStocks.filter((stock) => !user.allocation.some((asset) => asset.stock.symbol === stock.symbol));
  rebalancedStocks = rebalancedStocks.concat(toSell.map((stock) => Stock.rebalance(stock, totalSum, 0)));

  const portfolio = {
    sumInPosition: newSumInPosition,
    availableToTrade: totalSum - newSumInPosition,
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
