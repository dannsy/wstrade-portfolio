import { Router } from 'express';
import { getMe, postLogin, postRefresh } from '../controllers/user.controller.js';
import { errorCatchingMiddleware } from '../middlewares/error.middleware.js';
import {
  bodyRefreshToken,
  headerEmail,
  validateLogin,
  validationMiddleware,
} from '../middlewares/validation.middleware.js';

const router = Router();

router.post('/login', validateLogin(), validationMiddleware, errorCatchingMiddleware(postLogin));
router.post('/refresh', headerEmail(), bodyRefreshToken(), validationMiddleware, postRefresh);
router.get('/', headerEmail(), validationMiddleware, getMe);

export default router;
