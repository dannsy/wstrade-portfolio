import { getUser, saveUser, updateUserByEmail } from '../models/user/userDao.js';
import UserDto from '../models/user/userDto.js';
import { getAccounts, login, refresh } from '../services/wstrade-wrapper/wstrade-caller.js';
import { accountsMap } from '../utils/misc.js';
import NotFoundError from '../errors/NotFound.error.js';
import NotAuthorizedError from '../errors/NotAuthorized.error.js';

export async function postLogin(req, res, next) {
  const { email, password, otp } = req.body;

  let loginHeaders;
  try {
    loginHeaders = await login(email, password, otp);
  } catch (err) {
    // TODO: check for axios error message
    return next(new NotAuthorizedError());
  }
  const accessToken = loginHeaders['x-access-token'];
  const refreshToken = loginHeaders['x-refresh-token'];

  // TODO: handle this error too
  let accounts = await getAccounts(accessToken);
  accounts = accountsMap(accounts);
  const user = new UserDto(email, accessToken, refreshToken, accounts);
  saveUser(user);

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
    return next(new NotFoundError('User'));
  }

  res.send(user);
}
