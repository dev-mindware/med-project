import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/logger/app-logger.service';
import { UserRole } from '@prisma/client';

type AuthUser = Awaited<ReturnType<UsersService['findById']>>;
type AuthCredentials = { email: string; name: string; password: string; role?: UserRole };
type PublicUser = Omit<NonNullable<AuthUser>, 'passwordHash'>;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private logger: AppLogger,
  ) {}

  async validateUser(email: string, pass: string): Promise<PublicUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await argon2.verify(user.passwordHash, pass))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async register(data: AuthCredentials): Promise<PublicUser> {
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

  async login(user: NonNullable<AuthUser>) {
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
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: this.getRefreshTokenExpiry(),
      },
    });
  }

  async refreshTokens(refreshToken: string) {
    let payload: { sub?: string };
    try {
      payload = await this.jwtService.verifyAsync<{ sub?: string }>(refreshToken, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      });
    } catch (error) {
      this.logger.warn('Refresh token verification failed', {
        context: 'AuthService', action: 'REFRESH_TOKEN_VERIFICATION_FAILED', error,
      });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!payload.sub) throw new UnauthorizedException('Invalid refresh token');
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');

    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    let matchedToken: (typeof storedTokens)[number] | undefined;
    for (const storedToken of storedTokens) {
      if (await argon2.verify(storedToken.tokenHash, refreshToken)) {
        matchedToken = storedToken;
        break;
      }
    }

    if (!matchedToken) throw new UnauthorizedException('Refresh token not recognized');

    if (matchedToken.revokedAt || matchedToken.expiresAt <= new Date()) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      this.logger.warn('Refresh token reuse detected', {
        context: 'AuthService', action: 'REFRESH_TOKEN_REUSE_DETECTED', userId: user.id,
      });
      throw new UnauthorizedException('Refresh token is no longer valid');
    }

    const accessToken = await this.jwtService.signAsync(
      { email: user.email, sub: user.id, role: user.role },
      { secret: this.configService.getOrThrow<string>('jwt.accessSecret'), expiresIn: this.configService.getOrThrow<string>('jwt.accessExpiresIn') },
    );
    const nextRefreshToken = await this.jwtService.signAsync(
      { email: user.email, sub: user.id, role: user.role },
      { secret: this.configService.getOrThrow<string>('jwt.refreshSecret'), expiresIn: this.configService.getOrThrow<string>('jwt.refreshExpiresIn') },
    );
    const nextHash = await argon2.hash(nextRefreshToken);

    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: matchedToken.id },
        data: { revokedAt: new Date(), replacedByTokenHash: nextHash },
      }),
      this.prisma.refreshToken.create({
        data: { userId: user.id, tokenHash: nextHash, expiresAt: this.getRefreshTokenExpiry() },
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: nextRefreshToken,
      user: this.toPublicUser(user),
    };
  }

  private getRefreshTokenExpiry(): Date {
    const configured = this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';
    const match = /^(\\d+)([smhd])$/.exec(configured);
    if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const value = Number(match[1]);
    const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    return new Date(Date.now() + value * (multipliers[match[2]] ?? 86_400_000));
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private toPublicUser(user: NonNullable<AuthUser>): PublicUser {
    const { passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
