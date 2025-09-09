import { Router } from 'express';
import chargeRouter from './charge.js';
import transactionsRouter from './transactions.js';
import configRouter from './config.js';

const router = Router();

router.use('/charge', chargeRouter);
router.use('/transactions', transactionsRouter);
router.use('/config', configRouter);

export default router;
