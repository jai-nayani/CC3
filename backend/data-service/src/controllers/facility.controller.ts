import { Request, Response, NextFunction } from 'express';
import {
  prismaClient,
  successResponse,
  paginatedResponse,
  NotFoundError
} from '@financial-analytics/shared';

export class FacilityController {
  /**
   * Get all facilities with pagination
   */
  getAllFacilities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, isActive } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const skip = (page - 1) * limit;

      const where: any = {};

      if (type) {
        where.type = type as string;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const [facilities, total] = await Promise.all([
        prismaClient.facility.findMany({
          where,
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                departments: true,
                claims: true
              }
            }
          },
          orderBy: { name: 'asc' },
        }),
        prismaClient.facility.count({ where }),
      ]);

      res.json(paginatedResponse(facilities, total, page, limit));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a single facility by ID
   */
  getFacilityById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facility = await prismaClient.facility.findUnique({
        where: { id: req.params.id },
        include: {
          departments: {
            select: {
              id: true,
              name: true,
              specialty: true,
              code: true,
              _count: {
                select: { claims: true }
              }
            },
            orderBy: { name: 'asc' }
          },
          _count: {
            select: {
              departments: true,
              claims: true
            }
          }
        },
      });

      if (!facility) {
        throw new NotFoundError('Facility');
      }

      res.json(successResponse(facility));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new facility
   */
  createFacility = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        type,
        bedCount,
        address,
        city,
        state,
        zipCode,
        isActive
      } = req.body;

      const facility = await prismaClient.facility.create({
        data: {
          name,
          type,
          bedCount: bedCount ? parseInt(bedCount) : undefined,
          address,
          city,
          state,
          zipCode,
          isActive: isActive !== undefined ? isActive : true
        },
        include: {
          _count: {
            select: {
              departments: true,
              claims: true
            }
          }
        }
      });

      res.status(201).json(successResponse(facility));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a facility
   */
  updateFacility = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        type,
        bedCount,
        address,
        city,
        state,
        zipCode,
        isActive
      } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (type !== undefined) updateData.type = type;
      if (bedCount !== undefined) updateData.bedCount = parseInt(bedCount);
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (state !== undefined) updateData.state = state;
      if (zipCode !== undefined) updateData.zipCode = zipCode;
      if (isActive !== undefined) updateData.isActive = isActive;

      const facility = await prismaClient.facility.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          _count: {
            select: {
              departments: true,
              claims: true
            }
          }
        }
      });

      res.json(successResponse(facility));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete (deactivate) a facility
   */
  deleteFacility = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prismaClient.facility.update({
        where: { id: req.params.id },
        data: { isActive: false }
      });

      res.json(successResponse({ message: 'Facility deactivated successfully' }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get facility statistics
   */
  getFacilityStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.params.id;

      const [
        facility,
        claimStats,
        recentClaims
      ] = await Promise.all([
        prismaClient.facility.findUnique({
          where: { id: facilityId },
          include: {
            _count: {
              select: { departments: true, claims: true }
            }
          }
        }),
        prismaClient.claim.aggregate({
          where: { facilityId },
          _sum: {
            grossAmount: true,
            netAmount: true,
            paymentAmount: true,
            outstandingAmount: true
          },
          _count: { id: true }
        }),
        prismaClient.claim.findMany({
          where: { facilityId },
          take: 10,
          orderBy: { serviceDate: 'desc' },
          select: {
            id: true,
            claimNumber: true,
            serviceDate: true,
            netAmount: true,
            status: true
          }
        })
      ]);

      if (!facility) {
        throw new NotFoundError('Facility');
      }

      const stats = {
        facility: {
          id: facility.id,
          name: facility.name,
          type: facility.type,
          departmentCount: facility._count.departments,
          totalClaims: facility._count.claims
        },
        financial: {
          totalGrossAmount: claimStats._sum.grossAmount || 0,
          totalNetAmount: claimStats._sum.netAmount || 0,
          totalPayments: claimStats._sum.paymentAmount || 0,
          outstandingBalance: claimStats._sum.outstandingAmount || 0
        },
        recentClaims
      };

      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  };
}
