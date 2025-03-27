import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { GoalController } from './goal.controller';
import { Goal } from './goal.entity';
import { GoalService } from './goal.service';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
	imports: [
		RouterModule.register([{ path: '/goals', module: GoalModule }]),
		TypeOrmModule.forFeature([Goal]),
		RolePermissionModule
	],
	controllers: [GoalController],
	providers: [GoalService],
	exports: [GoalService]
})
export class GoalModule { }
