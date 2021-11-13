export default class UserDto {
  constructor(email, accessToken, refreshToken, accounts) {
    this.email = email;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.accounts = accounts;
  }
}
