import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { LoggerModule } from 'nestjs-pino';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RedisThrottlerStorage } from './common/redis-throttler.storage';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyMiddleware } from './common/middleware/api-key.middleware';
import 'http';

declare module 'http' {
  interface IncomingMessage {
    correlationId?: string;
  }
}
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{ ttl: 900000, limit: 5 }],
        storage: new RedisThrottlerStorage(
          config.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
        ),
      }),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: { target: 'pino-pretty' }, // pretty-prints in dev
        customProps: (req) => ({ correlationId: req.correlationId }),
      },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DATABASE_URI'),
      }),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
    consumer.apply(ApiKeyMiddleware).forRoutes('*');
  }
}
