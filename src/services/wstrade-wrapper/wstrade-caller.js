import axios from 'axios';
import * as wstradeEndpoints from './wstrade-endpoints.js';

export async function login(email, password, otp) {
  const response = await axios(wstradeEndpoints.login(email, password, otp));
  return response.headers;
}

export async function refresh(refreshToken) {
  const response = await axios(wstradeEndpoints.refresh(refreshToken));
  return response.headers;
}

export async function getAccounts(accessToken) {
  const response = await axios(wstradeEndpoints.getAccounts(accessToken));
  return response.data.results;
}
