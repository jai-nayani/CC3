import { Router } from 'express';
import { FacilityController } from '../controllers/facility.controller';

const router = Router();
const facilityController = new FacilityController();

// GET /facilities - Get all facilities with pagination
router.get('/', facilityController.getAllFacilities);

// GET /facilities/:id/stats - Get facility statistics (must be before /:id)
router.get('/:id/stats', facilityController.getFacilityStats);

// GET /facilities/:id - Get a single facility by ID
router.get('/:id', facilityController.getFacilityById);

// POST /facilities - Create a new facility
router.post('/', facilityController.createFacility);

// PUT /facilities/:id - Update a facility
router.put('/:id', facilityController.updateFacility);

// DELETE /facilities/:id - Deactivate a facility
router.delete('/:id', facilityController.deleteFacility);

export { router as facilityRouter };
