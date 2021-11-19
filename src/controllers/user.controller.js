import { getUser, saveUser, updateUserByEmail } from '../models/user/userDao.js';
import UserDto from '../models/user/userDto.js';
import { getAccounts, login, refresh } from '../services/wstrade-wrapper/wstrade-caller.js';
import { accountsMap } from '../utils/misc.js';

// TODO: add try catch for axios error
export async function postLogin(req, res, next) {
  const { email, password, otp } = req.body;

  const loginHeaders = await login(email, password, otp);
  const accessToken = loginHeaders['x-access-token'];
  const refreshToken = loginHeaders['x-refresh-token'];

  let accounts = await getAccounts(accessToken);
  accounts = accountsMap(accounts);
  const user = new UserDto(email, accessToken, refreshToken, accounts);
  saveUser(user);

  res.send({ accessToken, refreshToken });
}

export async function postRefresh(req, res, next) {
  const { email } = req.headers;
  const { refreshToken } = req.body;

  const refreshHeaders = await refresh(refreshToken);
  const accessToken = refreshHeaders['x-access-token'];
  const newRefreshToken = refreshHeaders['x-refresh-token'];

  let accounts = await getAccounts(accessToken);
  accounts = accountsMap(accounts);
  updateUserByEmail(email, accessToken, refreshToken, accounts);

  res.send({ accessToken, refreshToken: newRefreshToken });
}

// TODO: add total amount of money
export async function getMe(req, res, next) {
  const { email } = req.headers;

  const user = getUser(email);
  if (!user) {
    return next(new Error(`User with email ${email} not found`));
  }

  res.send(user);
}
