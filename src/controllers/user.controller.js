import * as userDao from '../models/user/user.dao.js';
import UserDto from '../models/user/User.dto.js';
import { getAccounts, login, refresh } from '../services/wstrade-wrapper/wstrade-caller.js';
import { accountsMap } from '../utils/misc.js';

async function getTokensAndAccounts(headers) {
  const accessToken = headers['x-access-token'];
  const refreshToken = headers['x-refresh-token'];

  let accounts = await getAccounts(accessToken);
  accounts = accountsMap(accounts);
  return { accessToken, refreshToken, accounts };
}

export async function postLogin(req, res) {
  const { email, password, otp } = req.body;

  const loginHeaders = await login(email, password, otp);
  const { accessToken, refreshToken, accounts } = await getTokensAndAccounts(loginHeaders);
  const user = new UserDto(email, accessToken, refreshToken, accounts);
  await userDao.saveUser(user);

  res.send({ accessToken, refreshToken });
}

export async function postRefresh(req, res) {
  const { email } = req.headers;
  const { refreshToken } = req.body;

  const refreshHeaders = await refresh(refreshToken);
  const { accessToken, refreshToken: newRefreshToken, accounts } = await getTokensAndAccounts(refreshHeaders);
  await userDao.updateUserByEmail(email, accessToken, newRefreshToken, accounts);

  res.send({ accessToken, refreshToken: newRefreshToken });
}

export async function getUser(req, res) {
  const { email } = req.headers;
  const user = await userDao.getUser(email);
  res.send(user);
}

// TODO: have option to either just tokens or the entire user account
export async function deleteUser(req, res) {
  const { email } = req.headers;
  await userDao.deleteUser(email);
  res.send({ message: 'User delete successful' });
}
