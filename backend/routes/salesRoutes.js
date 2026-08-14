import express from 'express';
import {
  getSales,
  getSaleById,
  createSale,
} from '../controllers/salesController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getSales)
  .post(protect, createSale);

router.route('/:id')
  .get(protect, getSaleById);

export default router;
