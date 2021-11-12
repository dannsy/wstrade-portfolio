import axios from 'axios';
import * as wstradeEndpoints from './wstrade-endpoints.js';

export async function login(email, password, otp) {
  const response = await axios(wstradeEndpoints.login(email, password, otp));
  return { headers: response.headers, body: response.data };
}
