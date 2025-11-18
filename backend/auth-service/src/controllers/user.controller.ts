import { Request, Response, NextFunction } from 'express';
import { prismaClient, successResponse, paginatedResponse, hashPassword, UserRole } from '@financial-analytics/shared';

export class UserController {
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prismaClient.user.findMany({
          skip,
          take: limit,
          select: { id: true, email: true, name: true, role: true, isActive: true, lastLogin: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        }),
        prismaClient.user.count(),
      ]);

      res.json(paginatedResponse(users, total, page, limit));
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prismaClient.user.findUnique({
        where: { id: req.params.id },
        select: { id: true, email: true, name: true, role: true, facilityAccess: true, isActive: true, lastLogin: true, createdAt: true },
      });

      if (!user) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
      }

      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, role, facilityAccess } = req.body;

      const passwordHash = await hashPassword(password);

      const user = await prismaClient.user.create({
        data: { email, passwordHash, name, role: role || UserRole.ANALYST, facilityAccess: facilityAccess || [] },
        select: { id: true, email: true, name: true, role: true, facilityAccess: true },
      });

      res.status(201).json(successResponse(user));
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, role, facilityAccess } = req.body;

      const user = await prismaClient.user.update({
        where: { id: req.params.id },
        data: { name, role, facilityAccess },
        select: { id: true, email: true, name: true, role: true, facilityAccess: true },
      });

      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  };

  deactivateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prismaClient.user.update({
        where: { id: req.params.id },
        data: { isActive: false },
      });

      res.json(successResponse({ message: 'User deactivated successfully' }));
    } catch (error) {
      next(error);
    }
  };
}
