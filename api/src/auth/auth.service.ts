import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/logger/app-logger.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private logger: AppLogger,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await argon2.verify(user.passwordHash, pass))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async register(data: any) {
    const passwordHash = await argon2.hash(data.password);
    const user = await this.usersService.create({
      email: data.email,
      name: data.name,
      passwordHash,
      role: data.role || 'OPERATOR',
    });
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
      expiresIn: this.configService.getOrThrow<string>('jwt.accessExpiresIn'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn: this.configService.getOrThrow<string>('jwt.refreshExpiresIn'),
    });

    await this.updateRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhotoUrl: user.profilePhotoUrl,
        lastPasswordChangeAt: user.lastPasswordChangeAt,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.toPublicUser(user);
  }

  async updateProfile(userId: string, data: { name?: string; profilePhotoUrl?: string }) {
    const user = await this.usersService.update(userId, {
      ...(typeof data.name === 'string' ? { name: data.name.trim() } : {}),
      ...(typeof data.profilePhotoUrl === 'string' ? { profilePhotoUrl: data.profilePhotoUrl } : {}),
    });
    return this.toPublicUser(user);
  }

  async updateEmail(userId: string, email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.usersService.findByEmail(normalizedEmail);
    if (existing && existing.id !== userId) {
      throw new ConflictException('Email already in use');
    }

    const user = await this.usersService.update(userId, { email: normalizedEmail });
    return this.toPublicUser(user);
  }

  async updatePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isCurrentPasswordValid = await argon2.verify(user.passwordHash, data.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await argon2.hash(data.newPassword);
    const updatedUser = await this.usersService.update(userId, {
      passwordHash,
      lastPasswordChangeAt: new Date(),
    });
    return this.toPublicUser(updatedUser);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const tokenHash = await argon2.hash(refreshToken);
    
    // Invalidate old tokens and create new one (simplified rotation)
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  async refreshTokens(refreshToken: string) {
    let userId: string;
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      userId = payload.sub;
    } catch (error) {
      this.logger.warn('Refresh token verification failed', {
        context: 'AuthService',
        action: 'REFRESH_TOKEN_VERIFICATION_FAILED',
        error,
      });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { userId },
    });

    let isValid = false;
    for (const t of storedTokens) {
      if (await argon2.verify(t.tokenHash, refreshToken)) {
        isValid = true;
        break;
      }
    }
    
    if (!isValid) throw new UnauthorizedException('Refresh token not recognized');

    return this.login(user);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private toPublicUser(user: any) {
    const { passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
