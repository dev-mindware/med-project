import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { Request } from 'express';
import { AppLogger } from '../logger/app-logger.service';

export const BAN_CACHE_PREFIX = 'abuse:ban:';
export const VIOLATION_CACHE_PREFIX = 'abuse:violations:';

@Injectable()
export class AbuseProtectionGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly logger: AppLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    // 1. Verificar se o IP está em ban temporário
    const isBanned = await this.cacheManager.get<boolean>(`${BAN_CACHE_PREFIX}${ip}`);
    if (isBanned) {
      this.logger.warn('Blocked banned IP request', {
        context: 'AbuseProtectionGuard',
        action: 'BANNED_IP_REJECTED',
        meta: { ip, path: req.path, method: req.method },
      });
      throw new HttpException(
        'Acesso temporariamente bloqueado devido a atividade automatizada suspeita.',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }

  /**
   * Bane temporariamente um IP por abuso identificado
   */
  async banIp(ip: string, reason: string, durationMs = 900_000): Promise<void> {
    await this.cacheManager.set(`${BAN_CACHE_PREFIX}${ip}`, true, durationMs);
    this.logger.warn(`IP banned for ${durationMs / 1000}s`, {
      context: 'AbuseProtectionGuard',
      action: 'IP_BANNED',
      meta: { ip, reason, durationMs },
    });
  }

  /**
   * Regista violação e aplica ban progressivo após 5 violações na janela de 1 hora
   */
  async recordViolation(ip: string, reason: string): Promise<void> {
    const key = `${VIOLATION_CACHE_PREFIX}${ip}`;
    const count = ((await this.cacheManager.get<number>(key)) ?? 0) + 1;
    await this.cacheManager.set(key, count, 3_600_000); // Janela de 1 hora

    if (count >= 5) {
      await this.banIp(ip, `Limite de violações excedido (${count}): ${reason}`, 1_800_000); // 30 min
    }
  }
}
