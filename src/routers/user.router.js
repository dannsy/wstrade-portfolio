import { Router } from 'express';
import { errorCatchingMiddleware } from '../middlewares/error.middleware.js';
import {
  bodyRefreshToken,
  headerEmail,
  validateLogin,
  validationMiddleware,
} from '../middlewares/validation.middleware.js';
import { deleteUser, getUser, postLogin, postRefresh } from '../controllers/user.controller.js';

const router = Router();

router.post('/login', validateLogin(), validationMiddleware, errorCatchingMiddleware(postLogin));
router.post('/refresh', headerEmail(), bodyRefreshToken(), validationMiddleware, errorCatchingMiddleware(postRefresh));
router.get('/', headerEmail(), validationMiddleware, errorCatchingMiddleware(getUser));
router.delete('/', headerEmail(), validationMiddleware, errorCatchingMiddleware(deleteUser));

export default router;
