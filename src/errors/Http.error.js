export default class HttpError extends Error {
  constructor(status, message, info) {
    super(message);
    this.status = status;
    this.message = message;
    this.info = info;
  }
}
