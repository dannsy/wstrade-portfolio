import InternalServerError from '../errors/InternalServer.error.js';

export function errorCatchingMiddleware(controller) {
  return async (req, res, next) => {
    try {
      return await controller(req, res, next);
    } catch (err) {
      console.err(err.message);
      return next(new InternalServerError());
    }
  };
}

export function errorHandlingMiddleware(err, req, res, next) {
  // Delegate to default Express error handler when headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  if (!err.status || !err.message) {
    err = new InternalServerError();
  }
  res.status(err.status).send(err.message);
}
