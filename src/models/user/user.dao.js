import redis from '../../config/redis.js';
import UserDto from './User.dto.js';

export async function getUser(email) {
  const userFieldsString = await redis.get(email);
  if (!userFieldsString) return null;

  const userFields = JSON.parse(userFieldsString);
  const user = new UserDto(email, userFields.accessToken, userFields.refreshToken, userFields.accounts);
  return user;
}

export function saveUser(user) {
  const userFieldsString = JSON.stringify(user);
  return redis.set(user.email, userFieldsString);
}

export async function updateUserByEmail(email, accessToken, refreshToken, accounts) {
  const user = await getUser(email);
  if (!user) return null;

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  user.accounts = accounts;
  return saveUser(user);
}

export async function deleteUser(email) {
  const deleteCount = await redis.del(email);
  if (deleteCount === 0) return null;
  else return 'OK';
}
