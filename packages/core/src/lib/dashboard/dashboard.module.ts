import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RolePermissionModule } from '../role-permission/role-permission.module';
import { CommandHandlers } from './commands/handlers';
import { Dashboard } from './dashboard.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmDashboardRepository } from './repository';

@Module({
	imports: [
		TypeOrmModule.forFeature([Dashboard]),
		RolePermissionModule,
		CqrsModule
	],
	controllers: [DashboardController],
	providers: [DashboardService, TypeOrmDashboardRepository, ...CommandHandlers],
	exports: [TypeOrmModule, DashboardService, TypeOrmDashboardRepository]
})
export class DashboardModule { }
