import { Router } from 'express';
import {
  bodyRefreshToken,
  headerEmail,
  validateLogin,
  validationMiddleware,
} from '../middlewares/validation.middleware.js';
import { getUser, saveUser, updateUserByEmail } from '../models/user/userDao.js';
import UserDto from '../models/user/userDto.js';
import { getAccounts, login, refresh } from '../services/wstrade-wrapper/wstrade-caller.js';
import { accountsMap } from '../utils/misc.js';

const router = Router();

router.post('/login', validateLogin(), validationMiddleware, async (req, res) => {
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

router.post('/refresh', headerEmail(), bodyRefreshToken(), validationMiddleware, async (req, res) => {
  const { email } = req.headers;
  const { refreshToken } = req.body;

  const refreshHeaders = await refresh(refreshToken);
  const accessToken = refreshHeaders['x-access-token'];
  const newRefreshToken = refreshHeaders['x-refresh-token'];

  let accounts = await getAccounts(accessToken);
  accounts = accountsMap(accounts);
  updateUserByEmail(email, accessToken, refreshToken, accounts);

  res.send({ accessToken, refreshToken: newRefreshToken });
});

router.get('/', headerEmail(), validationMiddleware, (req, res) => {
  const { email } = req.headers;

  const user = getUser(email);
  if (!user) {
    return res.status(404).send('User not found');
  }

  res.send(user);
});

export default router;
