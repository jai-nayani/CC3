import { Request, Response, NextFunction } from 'express';
import {
  prismaClient,
  successResponse,
  paginatedResponse,
  NotFoundError
} from '@financial-analytics/shared';

export class PayerController {
  /**
   * Get all payers with pagination
   */
  getAllPayers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const skip = (page - 1) * limit;

      const where: any = {};

      if (type) {
        where.type = type as string;
      }

      const [payers, total] = await Promise.all([
        prismaClient.payer.findMany({
          where,
          skip,
          take: limit,
          include: {
            _count: {
              select: { claims: true }
            }
          },
          orderBy: { name: 'asc' },
        }),
        prismaClient.payer.count({ where }),
      ]);

      res.json(paginatedResponse(payers, total, page, limit));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a single payer by ID
   */
  getPayerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payer = await prismaClient.payer.findUnique({
        where: { id: req.params.id },
        include: {
          _count: {
            select: { claims: true }
          }
        },
      });

      if (!payer) {
        throw new NotFoundError('Payer');
      }

      res.json(successResponse(payer));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new payer
   */
  createPayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        type,
        contractRate,
        averageDaysToPay
      } = req.body;

      const payer = await prismaClient.payer.create({
        data: {
          name,
          type,
          contractRate: contractRate ? parseFloat(contractRate) : undefined,
          averageDaysToPay: averageDaysToPay ? parseInt(averageDaysToPay) : undefined
        },
        include: {
          _count: {
            select: { claims: true }
          }
        }
      });

      res.status(201).json(successResponse(payer));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a payer
   */
  updatePayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        type,
        contractRate,
        averageDaysToPay
      } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (type !== undefined) updateData.type = type;
      if (contractRate !== undefined) updateData.contractRate = parseFloat(contractRate);
      if (averageDaysToPay !== undefined) updateData.averageDaysToPay = parseInt(averageDaysToPay);

      const payer = await prismaClient.payer.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          _count: {
            select: { claims: true }
          }
        }
      });

      res.json(successResponse(payer));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a payer
   */
  deletePayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if payer has claims
      const claimCount = await prismaClient.claim.count({
        where: { payerId: req.params.id }
      });

      if (claimCount > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PAYER_HAS_CLAIMS',
            message: `Cannot delete payer with ${claimCount} associated claims`
          }
        });
      }

      await prismaClient.payer.delete({
        where: { id: req.params.id }
      });

      res.json(successResponse({ message: 'Payer deleted successfully' }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get payer statistics
   */
  getPayerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payerId = req.params.id;

      const [
        payer,
        claimStats,
        statusBreakdown
      ] = await Promise.all([
        prismaClient.payer.findUnique({
          where: { id: payerId },
          include: {
            _count: {
              select: { claims: true }
            }
          }
        }),
        prismaClient.claim.aggregate({
          where: { payerId },
          _sum: {
            grossAmount: true,
            netAmount: true,
            paymentAmount: true,
            outstandingAmount: true
          },
          _avg: {
            netAmount: true
          }
        }),
        prismaClient.claim.groupBy({
          by: ['status'],
          where: { payerId },
          _count: { status: true }
        })
      ]);

      if (!payer) {
        throw new NotFoundError('Payer');
      }

      const stats = {
        payer: {
          id: payer.id,
          name: payer.name,
          type: payer.type,
          contractRate: payer.contractRate,
          averageDaysToPay: payer.averageDaysToPay,
          totalClaims: payer._count.claims
        },
        financial: {
          totalGrossAmount: claimStats._sum.grossAmount || 0,
          totalNetAmount: claimStats._sum.netAmount || 0,
          totalPayments: claimStats._sum.paymentAmount || 0,
          outstandingBalance: claimStats._sum.outstandingAmount || 0,
          averageClaimAmount: claimStats._avg.netAmount || 0
        },
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
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
