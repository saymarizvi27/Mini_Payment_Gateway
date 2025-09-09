import { Router } from 'express';
import { updateFraudRules } from '../controllers/configController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.put('/fraud-rules', requireAdmin, updateFraudRules);

export default router;
