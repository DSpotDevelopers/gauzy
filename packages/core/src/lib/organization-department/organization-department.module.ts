import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { OrganizationDepartment } from './organization-department.entity';
import { OrganizationDepartmentController } from './organization-department.controller';
import { OrganizationDepartmentService } from './organization-department.service';
import { CommandHandlers } from './commands/handlers';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
	imports: [
		RouterModule.register([
			{
				path: '/organization-department',
				module: OrganizationDepartmentModule
			}
		]),
		TypeOrmModule.forFeature([OrganizationDepartment]),
		RolePermissionModule,
		CqrsModule
	],
	controllers: [OrganizationDepartmentController],
	providers: [OrganizationDepartmentService, ...CommandHandlers],
	exports: [TypeOrmModule, OrganizationDepartmentService]
})
export class OrganizationDepartmentModule { }
