import { Router } from 'express';
import { postCharge } from '../controllers/chargeController.js';

const router = Router();

router.post('/', postCharge);

export default router;
