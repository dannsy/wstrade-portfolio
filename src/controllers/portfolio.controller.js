import { getUser } from '../models/user/userDao.js';
import { getPositions } from '../services/wstrade-wrapper/wstrade-caller.js';
import { sumAvailableToTrade } from '../utils/misc.js';
import NotFoundError from '../errors/NotFound.error.js';

export async function getAllocation(req, res, next) {
  const { email } = req.headers;

  const user = getUser(email);
  if (!user) {
    return next(new NotFoundError('User'));
  }
  const { accessToken, accounts } = user;
  const positions = await getPositions(accessToken);

  let sum = 0;
  const stocks = [];
  for (const position of positions) {
    const amount = position.quantity * position.quote.last;
    sum += amount;
    stocks.push({ symbol: position.stock.symbol, accountId: position.account_id, amount });
  }
  for (const stock of stocks) {
    stock.percentage = stock.amount / sum;
  }

  const availableToTrade = sumAvailableToTrade(accounts);
  console.log(availableToTrade);
  const allocation = {
    inPosition: sum,
    availableToTrade,
    totalSum: sum + availableToTrade,
    stocks,
  };
  res.send(allocation);
}
