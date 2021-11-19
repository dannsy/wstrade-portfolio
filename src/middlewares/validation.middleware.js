import { header, body, validationResult } from 'express-validator';

export function headerEmail() {
  return header('email').isEmail();
}

export function bodyEmail() {
  return body('email').isEmail();
}

export function bodyPassword() {
  return body('password').isString();
}

export function bodyOtp() {
  return body('otp').isString();
}

export function bodyRefreshToken() {
  return body('refreshToken').isString();
}

export function validateLogin() {
  return validate([bodyEmail(), bodyPassword(), bodyOtp()]);
}

function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    next();
  };
}

export function validationMiddleware(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  // TODO: descriptive error
  next(new Error('Request validation error'));
}
