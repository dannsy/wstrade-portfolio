import { Router } from 'express';
import { getUser } from '../models/user/userDao.js';
import { getPositions } from '../services/wstrade-wrapper/wstrade-caller.js';
import { roundTo } from '../utils/misc.js';

const router = Router();

router.get('/allocation', async (req, res) => {
  const { email } = req.headers;

  const { accessToken, accounts } = getUser(email);
  const positions = await getPositions(accessToken);

  let sum = 0;
  const amountPerStock = {};
  positions.forEach((position) => {
    let amount = position.quantity * position.quote.last;
    amount = roundTo(amount);
    sum += amount;
    amountPerStock[position.stock.symbol] = { amount, accountId: position.account_id };
  });
  sum = roundTo(sum);

  Object.keys(amountPerStock).forEach((key) => {
    amountPerStock[key].percentage = amountPerStock[key].amount / sum;
  });

  // TODO: add available to trade
  const availableToTrade = accounts[0].availableToTrade;
  const amountPerStockAndSum = {
    sumInPosition: sum,
    availableToTrade,
    totalSum: sum + availableToTrade,
    stocks: amountPerStock,
  };

  res.send(amountPerStockAndSum);
});

export default router;
