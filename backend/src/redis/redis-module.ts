import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // ← add this
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
