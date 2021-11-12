export default class UserDto {
  constructor(email, accessToken, refreshToken) {
    this.email = email;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
