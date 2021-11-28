import { getUser } from '../models/user/user.dao.js';
import { getPositions, getSecurityById } from '../services/wstrade-wrapper/wstrade-caller.js';
import { roundTo, sumAvailableToTrade } from '../utils/misc.js';
import NotFoundError from '../errors/NotFound.error.js';

// TODO: this is temporary, remove in future
const PREFERRED_STOCK_ALLOCATION = [
  { symbol: 'XEQT', id: '0', percentage: 0.8 },
  { symbol: 'VAB', id: '1', percentage: 0.2 },
];

async function getPositionsInfo(email) {
  const user = await getUser(email);
  if (!user) return null;

  const { accessToken } = user;
  const positions = await getPositions(accessToken);

  let sum = 0;
  const stocks = [];
  const stocksIndexMap = new Map();
  for (const position of positions) {
    const amount = position.quantity * position.quote.last;
    sum += amount;
    stocks.push({
      symbol: position.stock.symbol,
      id: position.id,
      quantity: position.quantity,
      quote: Number(position.quote.last),
      amount: amount,
      accountId: position.account_id,
    });
    stocksIndexMap.set(position.stock.symbol, stocks.length - 1);
  }

  return { sum, stocks, stocksIndexMap };
}

export async function getPortfolio(req, res, next) {
  const { email } = req.headers;

  const positionsInfo = await getPositionsInfo(email);
  if (!positionsInfo) return next(new NotFoundError('User'));

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

  const { accounts } = await getUser(email);
  const availableToTrade = sumAvailableToTrade(accounts);
  const portfolio = {
    inPosition: sum,
    availableToTrade: availableToTrade,
    totalSum: sum + availableToTrade,
    stocks: stocks,
  };
  res.send(portfolio);
}

export async function getRebalancedPortfolio(req, res, next) {
  const { email } = req.headers;

  const positionsInfo = await getPositionsInfo(email);
  if (!positionsInfo) return next(new NotFoundError('User'));

  let { sum, stocks: heldStocks, stocksIndexMap } = positionsInfo;
  const { accessToken, accounts } = await getUser(email);
  const availableToTrade = sumAvailableToTrade(accounts);
  const totalSum = sum + availableToTrade;

  let newSum = 0;
  const preferredStockAllocation = PREFERRED_STOCK_ALLOCATION;
  const rebalancedStocks = [];
  for (const stock of preferredStockAllocation) {
    let stockInfo;
    if (stocksIndexMap.has(stock.symbol)) {
      stockInfo = heldStocks[stocksIndexMap.get(stock.symbol)];
    } else {
      // TODO: work this thing out
      stockInfo = await getSecurityById(accessToken, stock.id);
      stockInfo.quantity = 0;
    }

    const amount = totalSum * stock.percentage;
    const requiredQuantity = Math.floor(amount / stockInfo.quote);
    const finalAmount = requiredQuantity * stockInfo.quote;
    newSum += finalAmount;
    // TODO: create function for constructing stock object
    rebalancedStocks.push({
      symbol: stockInfo.symbol,
      id: stockInfo.id,
      requiredQuantity: requiredQuantity,
      currentQuantity: stockInfo.quantity,
      changeInQuantity: requiredQuantity - stockInfo.quantity,
      quote: stockInfo.quote,
      finalAmount: roundTo(finalAmount),
      currentAmount: roundTo(stockInfo.amount),
      percentage: roundTo((finalAmount / totalSum) * 100) + '%',
      preferredPercentage: roundTo(stock.percentage * 100) + '%',
    });
  }

  const toSell = heldStocks
    .filter((stock0) => !preferredStockAllocation.some((stock1) => stock1.symbol === stock0.symbol))
    .map((stock) => stock.symbol);
  for (const symbol of toSell) {
    const stockInfo = heldStocks[stocksIndexMap.get(symbol)];
    rebalancedStocks.push({
      symbol: symbol,
      id: stockInfo.id,
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

export async function postPreferredAllocation(req, res, next) {
  // TODO: save stock allocation to mongodb, and make sure it adds up to 100%
  // TODO: find securityID for stock if not provided
}
