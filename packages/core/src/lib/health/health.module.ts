import { ConsoleLogger, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../core/entities/internal';
import { CacheHealthIndicator } from './indicators/cache-health.indicator';
import { RedisHealthIndicator } from './indicators/redis-health.indicator';
import { HealthController } from './health.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
	controllers: [HealthController],
	imports: [
		// We need to import the TypeOrmModule here to use Repositories in Health Service
		TypeOrmModule.forFeature([User]),
		DatabaseModule,
		TerminusModule.forRoot({
			logger: ConsoleLogger
			// https://docs.nestjs.com/recipes/terminus#graceful-shutdown-timeout
			// gracefulShutdownTimeoutMs: 1000
		})
	],
	providers: [CacheHealthIndicator, RedisHealthIndicator]
})
export class HealthModule { }
