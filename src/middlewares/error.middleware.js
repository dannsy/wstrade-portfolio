export function errorCatchingMiddleware(controller) {
  return async (req, res, next) => {
    try {
      return await controller(req, res, next);
    } catch (err) {
      // TODO: make this an internal server error
      console.log(err.message);
      return next(err);
    }
  };
}

export function errorHandlingMiddleware(err, req, res, next) {
  // Delegate to default Express error handler when headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  // console.error(err);
  res.status(400).send(err.message);
}
