import { Router } from 'express';
import { PayerController } from '../controllers/payer.controller';

const router = Router();
const payerController = new PayerController();

// GET /payers - Get all payers with pagination
router.get('/', payerController.getAllPayers);

// GET /payers/:id/stats - Get payer statistics (must be before /:id)
router.get('/:id/stats', payerController.getPayerStats);

// GET /payers/:id - Get a single payer by ID
router.get('/:id', payerController.getPayerById);

// POST /payers - Create a new payer
router.post('/', payerController.createPayer);

// PUT /payers/:id - Update a payer
router.put('/:id', payerController.updatePayer);

// DELETE /payers/:id - Delete a payer
router.delete('/:id', payerController.deletePayer);

export { router as payerRouter };
