import { Request, Response, NextFunction } from 'express';
import {
  prismaClient,
  successResponse,
  paginatedResponse,
  NotFoundError
} from '@financial-analytics/shared';

export class DepartmentController {
  /**
   * Get all departments with optional facility filter
   */
  getAllDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { facilityId, specialty } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const skip = (page - 1) * limit;

      const where: any = {};

      if (facilityId) {
        where.facilityId = facilityId as string;
      }

      if (specialty) {
        where.specialty = {
          contains: specialty as string,
          mode: 'insensitive'
        };
      }

      const [departments, total] = await Promise.all([
        prismaClient.department.findMany({
          where,
          skip,
          take: limit,
          include: {
            facility: {
              select: {
                id: true,
                name: true,
                type: true
              }
            },
            _count: {
              select: { claims: true }
            }
          },
          orderBy: { name: 'asc' },
        }),
        prismaClient.department.count({ where }),
      ]);

      res.json(paginatedResponse(departments, total, page, limit));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a single department by ID
   */
  getDepartmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const department = await prismaClient.department.findUnique({
        where: { id: req.params.id },
        include: {
          facility: {
            select: {
              id: true,
              name: true,
              type: true,
              city: true,
              state: true
            }
          },
          _count: {
            select: { claims: true }
          }
        },
      });

      if (!department) {
        throw new NotFoundError('Department');
      }

      res.json(successResponse(department));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get departments by facility ID
   */
  getDepartmentsByFacility = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.params.facilityId;

      const departments = await prismaClient.department.findMany({
        where: { facilityId },
        include: {
          _count: {
            select: { claims: true }
          }
        },
        orderBy: { name: 'asc' },
      });

      res.json(successResponse(departments));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new department
   */
  createDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        specialty,
        code,
        facilityId
      } = req.body;

      const department = await prismaClient.department.create({
        data: {
          name,
          specialty,
          code,
          facilityId
        },
        include: {
          facility: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          _count: {
            select: { claims: true }
          }
        }
      });

      res.status(201).json(successResponse(department));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a department
   */
  updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        specialty,
        code
      } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (specialty !== undefined) updateData.specialty = specialty;
      if (code !== undefined) updateData.code = code;

      const department = await prismaClient.department.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          facility: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          _count: {
            select: { claims: true }
          }
        }
      });

      res.json(successResponse(department));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a department
   */
  deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prismaClient.department.delete({
        where: { id: req.params.id }
      });

      res.json(successResponse({ message: 'Department deleted successfully' }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get department statistics
   */
  getDepartmentStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const departmentId = req.params.id;

      const [
        department,
        claimStats
      ] = await Promise.all([
        prismaClient.department.findUnique({
          where: { id: departmentId },
          include: {
            facility: {
              select: { id: true, name: true }
            },
            _count: {
              select: { claims: true }
            }
          }
        }),
        prismaClient.claim.aggregate({
          where: { departmentId },
          _sum: {
            grossAmount: true,
            netAmount: true,
            paymentAmount: true,
            outstandingAmount: true
          }
        })
      ]);

      if (!department) {
        throw new NotFoundError('Department');
      }

      const stats = {
        department: {
          id: department.id,
          name: department.name,
          specialty: department.specialty,
          facility: department.facility,
          totalClaims: department._count.claims
        },
        financial: {
          totalGrossAmount: claimStats._sum.grossAmount || 0,
          totalNetAmount: claimStats._sum.netAmount || 0,
          totalPayments: claimStats._sum.paymentAmount || 0,
          outstandingBalance: claimStats._sum.outstandingAmount || 0
        }
      };

      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  };
}
