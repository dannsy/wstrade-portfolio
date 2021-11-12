import { Router } from 'express';
import { login } from '../services/wstrade-wrapper/wstrade-caller.js';
import UserDto from '../models/user/userDto.js';
import { getUser, saveUser } from '../models/user/userDao.js';

const router = Router();

// TODO: error handling
router.post('/login', async (req, res) => {
  const { email, password, otp } = req.body;
  const { headers } = await login(email, password, otp);

  const accessToken = headers['x-access-token'];
  const refreshToken = headers['x-refresh-token'];
  const user = new UserDto(email, accessToken, refreshToken);
  saveUser(user);

  const userData = getUser(email);
  res.send(userData);
});

export default router;
