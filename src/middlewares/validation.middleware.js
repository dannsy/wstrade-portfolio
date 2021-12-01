import { header, body, validationResult } from 'express-validator';
import InvalidRequestError from '../errors/InvalidRequest.error.js';

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

export function bodyAllocation() {
  return body('allocation').isArray();
}

export function bodyFullDelete() {
  return body('fullDelete').optional().isBoolean();
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
  const errorFormatter = ({ location, msg, param, value }) => {
    if (typeof value === 'undefined') value = null;
    return { [`${location}[${param}]`]: value, msg };
  };

  const errors = validationResult(req).formatWith(errorFormatter);
  if (errors.isEmpty()) {
    next();
  } else {
    next(new InvalidRequestError(errors.array()));
  }
}
