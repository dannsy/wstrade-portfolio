export function errorMiddleware(err, req, res, next) {
  // Delegate to default Express error handler when headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);
  res.status(400).send(err.message);
}
