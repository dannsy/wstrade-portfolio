import HttpError from './Http.error.js';

export default class NotFoundError extends HttpError {
  constructor(resource) {
    super(404, `${resource} not found`);
  }
}
