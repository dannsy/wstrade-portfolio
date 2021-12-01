import { Router } from 'express';
import { getPortfolio, getRebalancedPortfolio, postAllocation } from '../controllers/portfolio.controller.js';
import { errorCatchingMiddleware } from '../middlewares/error.middleware.js';
import { bodyAllocation, headerEmail, validationMiddleware } from '../middlewares/validation.middleware.js';

const router = Router();

router.get('/', headerEmail(), validationMiddleware, errorCatchingMiddleware(getPortfolio));
router.get('/rebalance', headerEmail(), validationMiddleware, errorCatchingMiddleware(getRebalancedPortfolio));
router.post(
  '/allocation',
  headerEmail(),
  bodyAllocation(),
  validationMiddleware,
  errorCatchingMiddleware(postAllocation)
);

export default router;
