import { Router } from 'express';
import {
  getMe,
  login,
  logout,
  refreshSession,
  register,
  updatePassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authLimiter, registrationLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import {
  loginValidators,
  registerValidators,
  updatePasswordValidators,
} from '../validators/authValidators.js';

const router = Router();

router.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

router.post('/register', registrationLimiter, registerValidators, validate, register);
router.post('/login', authLimiter, loginValidators, validate, login);
router.post('/refresh', authLimiter, refreshSession);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.patch('/password', authenticate, authLimiter, updatePasswordValidators, validate, updatePassword);

export default router;
