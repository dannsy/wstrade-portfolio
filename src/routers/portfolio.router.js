import { Router } from 'express';
import { getAllocation } from '../controllers/portfolio.controller.js';
import { headerEmail, validationMiddleware } from '../middlewares/validation.middleware.js';

const router = Router();

router.get('/allocation', headerEmail(), validationMiddleware, getAllocation);

export default router;
