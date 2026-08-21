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
import { ChatGateway } from './gateway/chat/chat.gateway';
import 'http';
import { JwtModule } from '@nestjs/jwt';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/messages.module';
import { RedisModule } from './redis/redis-module';
import { S3Module } from './s3/s3.module';

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
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{ ttl: Number(process.env.THROTTLE_TTL_SECONDS ?? 60) * 1000, limit: 20 }],
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
    RoomsModule,
    MessagesModule,
    RedisModule,
    S3Module
  ],
  exports: [JwtModule], // is this here?
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }, ChatGateway],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
    consumer.apply(ApiKeyMiddleware).forRoutes('*');
  }
}
