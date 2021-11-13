import { Router } from 'express';
import { getAccounts, login, refresh } from '../services/wstrade-wrapper/wstrade-caller.js';
import UserDto from '../models/user/userDto.js';
import { getUser, saveUser, updateUserByEmail } from '../models/user/userDao.js';
import accountsMap from '../utils/accountsMap.js';

const router = Router();

// TODO: error handling and request validation
router.post('/login', async (req, res) => {
  const { email, password, otp } = req.body;

  const loginHeaders = await login(email, password, otp);
  const accessToken = loginHeaders['x-access-token'];
  const refreshToken = loginHeaders['x-refresh-token'];

  let accounts = await getAccounts(accessToken);
  accounts = accountsMap(accounts);
  const user = new UserDto(email, accessToken, refreshToken, accounts);
  saveUser(user);

  res.send({ accessToken, refreshToken });
});

router.post('/refresh', async (req, res) => {
  const { email, refreshToken } = req.body;

  const refreshHeaders = await refresh(refreshToken);
  const accessToken = refreshHeaders['x-access-token'];
  const newRefreshToken = refreshHeaders['x-refresh-token'];

  let accounts = await getAccounts(accessToken);
  accounts = accountsMap(accounts);
  updateUserByEmail(email, accessToken, refreshToken, accounts);

  res.send({ accessToken, refreshToken: newRefreshToken });
});

router.get('/', (req, res) => {
  const { email } = req.body;

  try {
    const user = getUser(email);
    res.send(user);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

export default router;
