import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { EmployeeAward } from './employee-award.entity';
import { EmployeeAwardController } from './employee-award.controller';
import { EmployeeAwardService } from './employee-award.service';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
	imports: [
		RouterModule.register([{ path: '/employee-award', module: EmployeeAwardModule }]),
		TypeOrmModule.forFeature([EmployeeAward]),
		RolePermissionModule
	],
	controllers: [EmployeeAwardController],
	providers: [EmployeeAwardService]
})
export class EmployeeAwardModule { }
