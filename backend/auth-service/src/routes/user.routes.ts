import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deactivateUser);

export { router as userRouter };
