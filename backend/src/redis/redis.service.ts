import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;

  constructor(private config: ConfigService) {
    const redisUrl =
      this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';

    this.client = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);
    this.publisher = new Redis(redisUrl);

    this.client.on('error', (err) => console.error('Redis client error:', err));
    this.publisher.on('error', (err) =>
      console.error('Redis publisher error:', err),
    );
    this.subscriber.on('error', (err) =>
      console.error('Redis subscriber error:', err),
    );
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

  // online presence — redis set
  async setOnline(userId: string) {
    await this.client.sadd('online_users', userId);
  }

  async setOffline(userId: string) {
    await this.client.srem('online_users', userId);
  }

  async getOnlineUsers(): Promise<string[]> {
    return this.client.smembers('online_users');
  }

  async isOnline(userId: string): Promise<boolean> {
    return (await this.client.sismember('online_users', userId)) === 1;
  }

  // pub/sub for multi-instance broadcasting
  async publish(channel: string, message: string) {
    await this.publisher.publish(channel, message);
  }

  async subscribe(channel: string, handler: (message: string) => void) {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, message) => {
      if (ch === channel) handler(message);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}
