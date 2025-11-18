import { Request, Response, NextFunction } from 'express';
import {
  prismaClient,
  successResponse,
  paginatedResponse,
  buildDateFilter,
  NotFoundError
} from '@financial-analytics/shared';

export class PaymentController {
  /**
   * Get all payments (claims with payment data)
   */
  getAllPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { facilityId, payerId, startDate, endDate } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const skip = (page - 1) * limit;

      const where: any = {
        paymentAmount: { gt: 0 },
        paymentDate: { not: null }
      };

      if (facilityId) {
        where.facilityId = facilityId as string;
      }

      if (payerId) {
        where.payerId = payerId as string;
      }

      // Date range filter on paymentDate
      const paymentDate = buildDateFilter({ startDate: startDate as string, endDate: endDate as string });
      if (paymentDate) {
        where.paymentDate = paymentDate;
      }

      const [payments, total] = await Promise.all([
        prismaClient.claim.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            claimNumber: true,
            patientName: true,
            serviceDate: true,
            paymentDate: true,
            paymentAmount: true,
            netAmount: true,
            outstandingAmount: true,
            status: true,
            facility: {
              select: { id: true, name: true }
            },
            payer: {
              select: { id: true, name: true, type: true }
            }
          },
          orderBy: { paymentDate: 'desc' },
        }),
        prismaClient.claim.count({ where }),
      ]);

      res.json(paginatedResponse(payments, total, page, limit));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get payment by claim ID
   */
  getPaymentByClaimId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await prismaClient.claim.findUnique({
        where: { id: req.params.claimId },
        select: {
          id: true,
          claimNumber: true,
          patientName: true,
          serviceDate: true,
          submissionDate: true,
          adjudicationDate: true,
          paymentDate: true,
          grossAmount: true,
          adjustmentAmount: true,
          netAmount: true,
          paymentAmount: true,
          outstandingAmount: true,
          status: true,
          facility: {
            select: { id: true, name: true }
          },
          department: {
            select: { id: true, name: true }
          },
          payer: {
            select: { id: true, name: true, type: true, averageDaysToPay: true }
          }
        },
      });

      if (!payment) {
        throw new NotFoundError('Payment/Claim');
      }

      res.json(successResponse(payment));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Record a payment on a claim
   */
  recordPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        claimId,
        paymentAmount,
        paymentDate,
        updatedBy
      } = req.body;

      // Fetch the claim to calculate outstanding amount
      const claim = await prismaClient.claim.findUnique({
        where: { id: claimId }
      });

      if (!claim) {
        throw new NotFoundError('Claim');
      }

      const totalPayment = claim.paymentAmount + parseFloat(paymentAmount);
      const outstandingAmount = claim.netAmount - totalPayment;

      // Determine new status based on payment
      let newStatus = claim.status;
      if (outstandingAmount <= 0) {
        newStatus = 'PAID';
      } else if (totalPayment > 0 && outstandingAmount > 0) {
        newStatus = 'PARTIAL_PAYMENT';
      }

      const updatedClaim = await prismaClient.claim.update({
        where: { id: claimId },
        data: {
          paymentAmount: totalPayment,
          paymentDate: new Date(paymentDate),
          outstandingAmount,
          status: newStatus,
          updatedBy
        },
        include: {
          facility: {
            select: { id: true, name: true }
          },
          department: {
            select: { id: true, name: true }
          },
          payer: {
            select: { id: true, name: true, type: true }
          }
        }
      });

      res.status(201).json(successResponse(updatedClaim));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get payment statistics
   */
  getPaymentStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { facilityId, startDate, endDate } = req.query;

      const where: any = {
        paymentAmount: { gt: 0 },
        paymentDate: { not: null }
      };

      if (facilityId) {
        where.facilityId = facilityId as string;
      }

      const paymentDate = buildDateFilter({ startDate: startDate as string, endDate: endDate as string });
      if (paymentDate) {
        where.paymentDate = paymentDate;
      }

      const [
        paymentStats,
        paymentsByPayer,
        paymentsByMonth
      ] = await Promise.all([
        prismaClient.claim.aggregate({
          where,
          _sum: {
            paymentAmount: true,
            netAmount: true
          },
          _count: { id: true },
          _avg: {
            paymentAmount: true
          }
        }),
        prismaClient.claim.groupBy({
          by: ['payerId'],
          where,
          _sum: {
            paymentAmount: true
          },
          _count: { id: true },
          orderBy: {
            _sum: {
              paymentAmount: 'desc'
            }
          },
          take: 10
        }),
        prismaClient.$queryRaw`
          SELECT
            DATE_TRUNC('month', "paymentDate") as month,
            SUM("paymentAmount") as total_payments,
            COUNT(*) as payment_count
          FROM claims
          WHERE "paymentAmount" > 0
            AND "paymentDate" IS NOT NULL
            ${facilityId ? prismaClient.$queryRawUnsafe(`AND "facilityId" = '${facilityId}'`) : prismaClient.$queryRawUnsafe('')}
          GROUP BY DATE_TRUNC('month', "paymentDate")
          ORDER BY month DESC
          LIMIT 12
        `
      ]);

      const stats = {
        summary: {
          totalPayments: paymentStats._sum.paymentAmount || 0,
          totalExpectedAmount: paymentStats._sum.netAmount || 0,
          paymentCount: paymentStats._count.id,
          averagePaymentAmount: paymentStats._avg.paymentAmount || 0,
          collectionRate: paymentStats._sum.netAmount
            ? ((paymentStats._sum.paymentAmount || 0) / paymentStats._sum.netAmount * 100).toFixed(2)
            : 0
        },
        topPayers: paymentsByPayer,
        monthlyTrend: paymentsByMonth
      };

      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  };
}
