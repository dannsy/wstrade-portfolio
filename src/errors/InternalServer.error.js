import HttpError from './Http.error.js';

export default class InternalServerError extends HttpError {
  constructor() {
    super(500, 'Internal server error');
  }
}
