import { Request, Response, NextFunction } from 'express';
import {
  prismaClient,
  successResponse,
  paginatedResponse,
  buildPaginationParams,
  buildDateFilter,
  NotFoundError
} from '@financial-analytics/shared';

export class ClaimController {
  /**
   * Get all claims with pagination and filtering
   */
  getAllClaims = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { facilityId, startDate, endDate, status, departmentId, payerId } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const skip = (page - 1) * limit;

      // Build filter conditions
      const where: any = {};

      if (facilityId) {
        where.facilityId = facilityId as string;
      }

      if (departmentId) {
        where.departmentId = departmentId as string;
      }

      if (payerId) {
        where.payerId = payerId as string;
      }

      if (status) {
        where.status = status as string;
      }

      // Date range filter on serviceDate
      const serviceDate = buildDateFilter({ startDate: startDate as string, endDate: endDate as string });
      if (serviceDate) {
        where.serviceDate = serviceDate;
      }

      // Execute query with pagination
      const [claims, total] = await Promise.all([
        prismaClient.claim.findMany({
          where,
          skip,
          take: limit,
          include: {
            facility: {
              select: { id: true, name: true, type: true }
            },
            department: {
              select: { id: true, name: true, specialty: true }
            },
            payer: {
              select: { id: true, name: true, type: true }
            }
          },
          orderBy: { serviceDate: 'desc' },
        }),
        prismaClient.claim.count({ where }),
      ]);

      res.json(paginatedResponse(claims, total, page, limit));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a single claim by ID
   */
  getClaimById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await prismaClient.claim.findUnique({
        where: { id: req.params.id },
        include: {
          facility: {
            select: { id: true, name: true, type: true, city: true, state: true }
          },
          department: {
            select: { id: true, name: true, specialty: true, code: true }
          },
          payer: {
            select: { id: true, name: true, type: true, contractRate: true, averageDaysToPay: true }
          }
        },
      });

      if (!claim) {
        throw new NotFoundError('Claim');
      }

      res.json(successResponse(claim));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new claim
   */
  createClaim = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        facilityId,
        departmentId,
        payerId,
        patientId,
        patientName,
        patientDOB,
        patientPhone,
        claimNumber,
        accountNumber,
        serviceDate,
        submissionDate,
        grossAmount,
        adjustmentAmount,
        netAmount,
        status,
        serviceType,
        diagnosisCode,
        procedureCode,
        units,
        createdBy
      } = req.body;

      // Calculate financial amounts
      const calculatedNetAmount = netAmount || (grossAmount - (adjustmentAmount || 0));
      const outstandingAmount = calculatedNetAmount;

      const claim = await prismaClient.claim.create({
        data: {
          facilityId,
          departmentId,
          payerId,
          patientId,
          patientName,
          patientDOB: patientDOB ? new Date(patientDOB) : undefined,
          patientPhone,
          claimNumber,
          accountNumber,
          serviceDate: new Date(serviceDate),
          submissionDate: submissionDate ? new Date(submissionDate) : undefined,
          grossAmount: parseFloat(grossAmount),
          adjustmentAmount: parseFloat(adjustmentAmount || 0),
          netAmount: calculatedNetAmount,
          outstandingAmount,
          status: status || 'SUBMITTED',
          serviceType,
          diagnosisCode,
          procedureCode,
          units: parseInt(units || 1),
          createdBy
        },
        include: {
          facility: {
            select: { id: true, name: true, type: true }
          },
          department: {
            select: { id: true, name: true, specialty: true }
          },
          payer: {
            select: { id: true, name: true, type: true }
          }
        }
      });

      res.status(201).json(successResponse(claim));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an existing claim
   */
  updateClaim = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        status,
        adjustmentAmount,
        paymentAmount,
        paymentDate,
        denialReason,
        denialCode,
        adjudicationDate,
        updatedBy
      } = req.body;

      // First fetch the existing claim to calculate outstanding amount
      const existingClaim = await prismaClient.claim.findUnique({
        where: { id: req.params.id }
      });

      if (!existingClaim) {
        throw new NotFoundError('Claim');
      }

      // Calculate new outstanding amount
      const newPaymentAmount = paymentAmount !== undefined
        ? parseFloat(paymentAmount)
        : existingClaim.paymentAmount;
      const newAdjustmentAmount = adjustmentAmount !== undefined
        ? parseFloat(adjustmentAmount)
        : existingClaim.adjustmentAmount;
      const newNetAmount = existingClaim.grossAmount - newAdjustmentAmount;
      const outstandingAmount = newNetAmount - newPaymentAmount;

      const updateData: any = {
        updatedBy
      };

      if (status !== undefined) updateData.status = status;
      if (adjustmentAmount !== undefined) {
        updateData.adjustmentAmount = newAdjustmentAmount;
        updateData.netAmount = newNetAmount;
      }
      if (paymentAmount !== undefined) {
        updateData.paymentAmount = newPaymentAmount;
      }
      if (paymentDate !== undefined) {
        updateData.paymentDate = new Date(paymentDate);
      }
      if (adjudicationDate !== undefined) {
        updateData.adjudicationDate = new Date(adjudicationDate);
      }
      if (denialReason !== undefined) updateData.denialReason = denialReason;
      if (denialCode !== undefined) updateData.denialCode = denialCode;

      updateData.outstandingAmount = outstandingAmount;

      const claim = await prismaClient.claim.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          facility: {
            select: { id: true, name: true, type: true }
          },
          department: {
            select: { id: true, name: true, specialty: true }
          },
          payer: {
            select: { id: true, name: true, type: true }
          }
        }
      });

      res.json(successResponse(claim));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a claim (soft delete by marking as written off)
   */
  deleteClaim = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prismaClient.claim.update({
        where: { id: req.params.id },
        data: { status: 'WRITTEN_OFF' }
      });

      res.json(successResponse({ message: 'Claim marked as written off successfully' }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get claim statistics
   */
  getClaimStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { facilityId, startDate, endDate } = req.query;

      const where: any = {};

      if (facilityId) {
        where.facilityId = facilityId as string;
      }

      const serviceDate = buildDateFilter({ startDate: startDate as string, endDate: endDate as string });
      if (serviceDate) {
        where.serviceDate = serviceDate;
      }

      const [
        totalClaims,
        totalGross,
        totalNet,
        totalPayments,
        statusCounts
      ] = await Promise.all([
        prismaClient.claim.count({ where }),
        prismaClient.claim.aggregate({
          where,
          _sum: { grossAmount: true }
        }),
        prismaClient.claim.aggregate({
          where,
          _sum: { netAmount: true }
        }),
        prismaClient.claim.aggregate({
          where,
          _sum: { paymentAmount: true }
        }),
        prismaClient.claim.groupBy({
          by: ['status'],
          where,
          _count: { status: true }
        })
      ]);

      const stats = {
        totalClaims,
        totalGrossAmount: totalGross._sum.grossAmount || 0,
        totalNetAmount: totalNet._sum.netAmount || 0,
        totalPayments: totalPayments._sum.paymentAmount || 0,
        outstandingBalance: (totalNet._sum.netAmount || 0) - (totalPayments._sum.paymentAmount || 0),
        statusBreakdown: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>)
      };

      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  };
}
