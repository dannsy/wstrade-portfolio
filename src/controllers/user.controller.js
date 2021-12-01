import User from '../models/User.js';
import { getAccounts, login, refresh } from '../services/wstrade-wrapper/wstrade-caller.js';
import { accountsMap } from '../utils/misc.js';
import NotFoundError from '../errors/NotFound.error.js';

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

  let user = await User.findOne({ email }).exec();
  if (!user) {
    user = new User({ email });
  }
  user.accounts = accounts;
  await user.setTokens(accessToken, refreshToken);
  await user.save();

  res.send({ accessToken, refreshToken });
}

export async function postRefresh(req, res) {
  const { email } = req.headers;
  const { refreshToken } = req.body;

  const user = await User.findOne({ email }).exec();
  if (!user) throw new NotFoundError('User');

  const refreshHeaders = await refresh(refreshToken);
  const { accessToken, refreshToken: newRefreshToken, accounts } = await getTokensAndAccounts(refreshHeaders);

  user.accounts = accounts;
  await user.setTokens(accessToken, newRefreshToken);
  await user.save();

  res.send({ accessToken, refreshToken: newRefreshToken });
}

export async function getUser(req, res) {
  const { email } = req.headers;

  const user = await User.findOne({ email }).exec();
  if (!user) throw new NotFoundError('User');
  const { accessToken, refreshToken } = await user.getTokens();

  res.send({ email: user.email, allocation: user.allocation, account: user.account, accessToken, refreshToken });
}

export async function deleteUser(req, res) {
  const { email } = req.headers;
  const { fullDelete } = req.body;

  const user = await User.findOne({ email }).exec();
  if (!user) throw new NotFoundError('User');
  await user.deleteTokens();
  if (fullDelete) {
    await User.deleteOne({ email }).exec();
  }

  res.send({ message: 'User delete successful' });
}
