import { Router } from 'express';
import { getPortfolio, getRebalancedPortfolio } from '../controllers/portfolio.controller.js';
import { errorCatchingMiddleware } from '../middlewares/error.middleware.js';
import { headerEmail, validationMiddleware } from '../middlewares/validation.middleware.js';

const router = Router();

router.get('/', headerEmail(), validationMiddleware, errorCatchingMiddleware(getPortfolio));
router.get('/rebalance', headerEmail(), validationMiddleware, errorCatchingMiddleware(getRebalancedPortfolio));

export default router;
