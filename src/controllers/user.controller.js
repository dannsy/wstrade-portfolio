import * as userDao from '../models/user/user.dao.js';
import UserDto from '../models/user/User.dto.js';
import { getAccounts, login, refresh } from '../services/wstrade-wrapper/wstrade-caller.js';
import { accountsMap } from '../utils/misc.js';
import NotFoundError from '../errors/NotFound.error.js';
import NotAuthorizedError from '../errors/NotAuthorized.error.js';

async function getTokensAndAccounts(headers) {
  const accessToken = headers['x-access-token'];
  const refreshToken = headers['x-refresh-token'];

  let accounts = await getAccounts(accessToken);
  accounts = accountsMap(accounts);
  return { accessToken, refreshToken, accounts };
}

export async function postLogin(req, res, next) {
  const { email, password, otp } = req.body;

  let loginHeaders;
  try {
    loginHeaders = await login(email, password, otp);
  } catch (err) {
    return next(new NotAuthorizedError());
  }

  const { accessToken, refreshToken, accounts } = await getTokensAndAccounts(loginHeaders);
  const user = new UserDto(email, accessToken, refreshToken, accounts);
  await userDao.saveUser(user);

  res.send({ accessToken, refreshToken });
}

export async function postRefresh(req, res, next) {
  const { email } = req.headers;
  const { refreshToken } = req.body;

  let refreshHeaders;
  try {
    refreshHeaders = await refresh(refreshToken);
  } catch (err) {
    return next(new NotAuthorizedError());
  }

  const { accessToken, refreshToken: newRefreshToken, accounts } = await getTokensAndAccounts(refreshHeaders);
  const updateSuccess = await userDao.updateUserByEmail(email, accessToken, newRefreshToken, accounts);
  if (!updateSuccess) {
    return next(new NotFoundError('User'));
  }

  res.send({ accessToken, refreshToken: newRefreshToken });
}

export async function getUser(req, res, next) {
  const { email } = req.headers;

  const user = await userDao.getUser(email);
  if (!user) {
    return next(new NotFoundError('User'));
  }

  res.send(user);
}

// TODO: have option to either just tokens or the entire user account
export async function deleteUser(req, res, next) {
  const { email } = req.headers;

  const deleteSuccess = await userDao.deleteUser(email);
  if (!deleteSuccess) {
    return next(new NotFoundError('User'));
  }

  res.send('OK');
}
