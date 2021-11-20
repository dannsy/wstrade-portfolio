import HttpError from './Http.error.js';

export default class NotAuthorizedError extends HttpError {
  constructor() {
    super(401, 'User not authorized');
  }
}
