import { Router } from 'express';
import { ClaimController } from '../controllers/claim.controller';

const router = Router();
const claimController = new ClaimController();

// GET /claims/stats - Get claim statistics (must be before /:id)
router.get('/stats', claimController.getClaimStats);

// GET /claims - Get all claims with pagination and filters
router.get('/', claimController.getAllClaims);

// GET /claims/:id - Get a single claim by ID
router.get('/:id', claimController.getClaimById);

// POST /claims - Create a new claim
router.post('/', claimController.createClaim);

// PUT /claims/:id - Update a claim
router.put('/:id', claimController.updateClaim);

// DELETE /claims/:id - Delete (write off) a claim
router.delete('/:id', claimController.deleteClaim);

export { router as claimRouter };
