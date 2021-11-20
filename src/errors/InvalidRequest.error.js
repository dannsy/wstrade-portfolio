import HttpError from './Http.error.js';

export default class InvalidRequestError extends HttpError {
  constructor() {
    super(400, 'Invalid request format');
  }
}
