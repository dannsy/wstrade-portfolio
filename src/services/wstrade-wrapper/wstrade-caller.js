import axios from 'axios';
import * as wstradeEndpoints from './wstrade-endpoints.js';
import NotAuthorizedError from '../../errors/NotAuthorized.error.js';

export async function login(email, password, otp) {
  try {
    const response = await axios(wstradeEndpoints.login(email, password, otp));
    return response.headers;
  } catch (err) {
    throw new NotAuthorizedError();
  }
}

export async function refresh(refreshToken) {
  try {
    const response = await axios(wstradeEndpoints.refresh(refreshToken));
    return response.headers;
  } catch (err) {
    throw new NotAuthorizedError();
  }
}

export async function getAccounts(accessToken) {
  const response = await axios(wstradeEndpoints.getAccounts(accessToken));
  return response.data.results;
}

export async function getSecurityQuery(accessToken, security) {
  const response = await axios(wstradeEndpoints.getSecurityQuery(accessToken, security));
  return response.data;
}

export async function getSecurityById(accessToken, securityId) {
  const response = await axios(wstradeEndpoints.getSecurityById(accessToken, securityId));
  return response.data;
}

export async function getPositions(accessToken) {
  const response = await axios(wstradeEndpoints.getPositions(accessToken));
  return response.data.results;
}
