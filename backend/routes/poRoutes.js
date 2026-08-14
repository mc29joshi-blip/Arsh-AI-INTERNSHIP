import express from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePOStatus,
  deletePurchaseOrder,
} from '../controllers/poController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getPurchaseOrders)
  .post(protect, createPurchaseOrder);

router.route('/:id')
  .get(protect, getPurchaseOrderById)
  .delete(protect, deletePurchaseOrder);

router.route('/:id/status')
  .put(protect, updatePOStatus);

export default router;
