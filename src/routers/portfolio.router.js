import { Router } from 'express';
import { getAllocation } from '../controllers/portfolio.controller.js';
import { errorCatchingMiddleware } from '../middlewares/error.middleware.js';
import { headerEmail, validationMiddleware } from '../middlewares/validation.middleware.js';

const router = Router();

router.get('/allocation', headerEmail(), validationMiddleware, errorCatchingMiddleware(getAllocation));

export default router;
