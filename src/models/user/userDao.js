import UserDto from './userDto.js';

const tempStore = {};

export function getUser(email) {
  const userFields = tempStore[email];
  if (!userFields) return null;

  const user = new UserDto(email, userFields.accessToken, userFields.refreshToken, userFields.accounts);
  return user;
}

export function saveUser(user) {
  tempStore[user.email] = {
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
    accounts: user.accounts,
  };
  return 'OK';
}

export function updateUserByEmail(email, accessToken, refreshToken, accounts) {
  const userFields = tempStore[email];
  if (!userFields) return null;

  userFields.accessToken = accessToken;
  userFields.refreshToken = refreshToken;
  userFields.accounts = accounts;
  return 'OK';
}
