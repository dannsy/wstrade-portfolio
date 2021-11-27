export default class UserDto {
  constructor(email, accessToken, refreshToken, accounts) {
    this.email = email;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.accounts = accounts;
  }

  toJSON() {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      accounts: this.accounts,
    };
  }
}
