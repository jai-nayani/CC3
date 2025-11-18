import jwt from 'jsonwebtoken';
import {
  prismaClient,
  hashPassword,
  comparePassword,
  isValidEmail,
  isValidPassword,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  type LoginResponse,
  type UserInfo,
  type JwtPayload,
  UserRole
} from '@financial-analytics/shared';

export class AuthService {
  private JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
  private JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

  async register(data: { email: string; password: string; name: string; role?: UserRole }): Promise<UserInfo> {
    // Validate email
    if (!isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password
    if (!isValidPassword(data.password)) {
      throw new ValidationError('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    }

    // Check if user already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prismaClient.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role || UserRole.ANALYST,
        facilityAccess: [],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        facilityAccess: true,
        createdAt: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      facilityAccess: user.facilityAccess,
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    // Find user
    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      facilityIds: user.facilityAccess,
    };

    const access_token = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRATION,
    });

    const refresh_token = jwt.sign(
      { sub: user.id, type: 'refresh' },
      this.JWT_SECRET,
      { expiresIn: this.JWT_REFRESH_EXPIRATION }
    );

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prismaClient.refreshToken.create({
      data: {
        token: refresh_token,
        userId: user.id,
        expiresAt,
      },
    });

    // Update last login
    await prismaClient.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      access_token,
      refresh_token,
      expires_in: 3600, // 1 hour in seconds
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        facilityAccess: user.facilityAccess,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as any;

      if (decoded.type !== 'refresh') {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Check if token exists in database
      const tokenRecord = await prismaClient.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new AuthenticationError('Refresh token expired or invalid');
      }

      // Generate new access token
      const payload: JwtPayload = {
        sub: tokenRecord.user.id,
        email: tokenRecord.user.email,
        role: tokenRecord.user.role,
        facilityIds: tokenRecord.user.facilityAccess,
      };

      const access_token = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.JWT_EXPIRATION,
      });

      return {
        access_token,
        expires_in: 3600,
      };
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // Delete all refresh tokens for this user
    await prismaClient.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async getUserProfile(userId: string): Promise<UserInfo> {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        facilityAccess: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      facilityAccess: user.facilityAccess,
    };
  }

  async updateProfile(userId: string, data: { name?: string }): Promise<UserInfo> {
    const user = await prismaClient.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        facilityAccess: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      facilityAccess: user.facilityAccess,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Validate new password
    if (!isValidPassword(newPassword)) {
      throw new ValidationError('New password must be at least 8 characters with uppercase, lowercase, number, and special character');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prismaClient.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate all refresh tokens
    await this.logout(userId);
  }
}
