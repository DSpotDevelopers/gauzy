import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionModule } from '../role-permission/role-permission.module';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLog } from './activity-log.entity';
import { ActivityLogService } from './activity-log.service';
import { EventHandlers } from './events/handlers';
import { TypeOrmActivityLogRepository } from './repository';

@Global()
@Module({
	imports: [
		TypeOrmModule.forFeature([ActivityLog]),
		CqrsModule,
		RolePermissionModule
	],
	controllers: [ActivityLogController],
	providers: [ActivityLogService, TypeOrmActivityLogRepository, ...EventHandlers],
	exports: [TypeOrmModule, ActivityLogService, TypeOrmActivityLogRepository]
})
export class ActivityLogModule { }
