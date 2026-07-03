import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor(private config: ConfigService) {
    this.client = new Redis(this.config.get<string>('REDIS_URL')!);
  }

  private hash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Call on logout — blacklist instantly
  async blacklistToken(token: string, ttlSeconds: number) {
    await this.client.set(`bl:${this.hash(token)}`, '1', 'EX', ttlSeconds);
  }

  // Call before trusting any refresh/access token
  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.client.get(`bl:${this.hash(token)}`);
    return result !== null;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
