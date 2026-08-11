import { Router } from 'express';
import { register, login, logout, refresh, getCurrentUser, getUsers } from '../controllers/authController';
import { validateRequest, authenticateUser, authorizeRoles } from '../middlewares/authMiddleware';
import { LoginSchema, RegisterSchema } from '@gigflow/shared';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validateRequest(RegisterSchema), register);
router.post('/login', authLimiter, validateRequest(LoginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', authenticateUser, getCurrentUser);
router.get('/users', authenticateUser, authorizeRoles('ADMIN'), getUsers);

export default router;
