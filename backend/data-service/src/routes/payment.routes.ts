import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const paymentController = new PaymentController();

// GET /payments/stats - Get payment statistics (must be before other routes)
router.get('/stats', paymentController.getPaymentStats);

// GET /payments - Get all payments with pagination and filters
router.get('/', paymentController.getAllPayments);

// GET /payments/claim/:claimId - Get payment details for a specific claim
router.get('/claim/:claimId', paymentController.getPaymentByClaimId);

// POST /payments - Record a new payment
router.post('/', paymentController.recordPayment);

export { router as paymentRouter };
