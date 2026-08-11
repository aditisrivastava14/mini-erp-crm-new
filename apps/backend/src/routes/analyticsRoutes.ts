import { Router } from 'express';
import { authenticateUser } from '../middlewares/authMiddleware';
import { getAnalyticsOverview } from '../controllers/analyticsController';

const router = Router();

router.use(authenticateUser);

router.get('/overview', getAnalyticsOverview);

export default router;