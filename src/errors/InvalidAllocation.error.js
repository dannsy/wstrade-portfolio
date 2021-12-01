import HttpError from './Http.error.js';

export default class InvalidAllocationError extends HttpError {
  constructor() {
    super(400, 'Asset allocation does not add up to 100%');
  }
}
