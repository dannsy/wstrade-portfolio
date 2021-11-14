import { Router } from 'express';
import { getUser } from '../models/user/userDao.js';
import { getPositions } from '../services/wstrade-wrapper/wstrade-caller.js';

const router = Router();

router.get('/allocation', async (req, res) => {
  const { email } = req.body;

  const { accessToken } = getUser(email);
  const positions = await getPositions(accessToken);

  let sum = 0;
  const amountPerStock = {};
  positions.forEach((position) => {
    const amount = position.quantity * position.quote.last;
    sum += amount;
    // TODO: round to 2 digits
    amountPerStock[position.stock.symbol] = { amount };
  });

  Object.keys(amountPerStock).forEach((key) => {
    amountPerStock[key].percentage = amountPerStock[key].amount / sum;
  });

  // TODO: add available to trade
  const amountPerStockAndSum = { sum, stocks: amountPerStock };

  res.send(amountPerStockAndSum);
});

export default router;
