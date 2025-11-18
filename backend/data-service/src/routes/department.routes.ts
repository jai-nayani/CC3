import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';

const router = Router();
const departmentController = new DepartmentController();

// GET /departments - Get all departments with optional facility filter
router.get('/', departmentController.getAllDepartments);

// GET /departments/facility/:facilityId - Get departments by facility
router.get('/facility/:facilityId', departmentController.getDepartmentsByFacility);

// GET /departments/:id/stats - Get department statistics (must be before /:id)
router.get('/:id/stats', departmentController.getDepartmentStats);

// GET /departments/:id - Get a single department by ID
router.get('/:id', departmentController.getDepartmentById);

// POST /departments - Create a new department
router.post('/', departmentController.createDepartment);

// PUT /departments/:id - Update a department
router.put('/:id', departmentController.updateDepartment);

// DELETE /departments/:id - Delete a department
router.delete('/:id', departmentController.deleteDepartment);

export { router as departmentRouter };
