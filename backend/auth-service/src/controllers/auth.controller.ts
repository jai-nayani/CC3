import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse, ValidationError, AuthenticationError } from '@financial-analytics/shared';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Email, password, and name are required'));
      }

      const result = await this.authService.register({ email, password, name, role });
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Email and password are required'));
      }

      const result = await this.authService.login(email, password);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Refresh token is required'));
      }

      const result = await this.authService.refreshToken(refresh_token);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.sub;
      await this.authService.logout(userId);
      res.json(successResponse({ message: 'Logged out successfully' }));
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.sub;
      const user = await this.authService.getUserProfile(userId);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.sub;
      const { name } = req.body;

      const updatedUser = await this.authService.updateProfile(userId, { name });
      res.json(successResponse(updatedUser));
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.sub;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Current and new passwords are required'));
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);
      res.json(successResponse({ message: 'Password changed successfully' }));
    } catch (error) {
      next(error);
    }
  };
}
