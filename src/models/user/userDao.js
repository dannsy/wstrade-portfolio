const tempStore = {};

export function getUser(email) {
  return tempStore[email];
}

export function saveUser(user) {
  tempStore[user.email] = {
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
  };
}
