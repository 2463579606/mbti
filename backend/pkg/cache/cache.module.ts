/**
 * Cache Module
 * Redis cache configuration
 */

import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const CACHE_PROVIDER = 'CACHE_PROVIDER';

@Global()
@Module({
  providers: [
    {
      provide: CACHE_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password') || undefined,
          db: configService.get('redis.db'),
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3,
        });

        redis.on('error', (err) => {
          console.error('Redis connection error:', err);
        });

        redis.on('connect', () => {
          console.log('Redis connected successfully');
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: [CACHE_PROVIDER],
})
export class CacheModule {}
