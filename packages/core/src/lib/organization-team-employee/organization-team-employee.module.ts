import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionModule } from '../role-permission/role-permission.module';
import { OrganizationTeamEmployeeController } from './organization-team-employee.controller';
import { OrganizationTeamEmployee } from './organization-team-employee.entity';
import { OrganizationTeamEmployeeService } from './organization-team-employee.service';
import { TaskModule } from './../tasks/task.module';
import { TypeOrmOrganizationTeamEmployeeRepository } from './repository';

@Module({
	imports: [
		TypeOrmModule.forFeature([OrganizationTeamEmployee]),
		RolePermissionModule,
		CqrsModule,
		TaskModule
	],
	controllers: [OrganizationTeamEmployeeController],
	providers: [OrganizationTeamEmployeeService, TypeOrmOrganizationTeamEmployeeRepository],
	exports: [TypeOrmModule, OrganizationTeamEmployeeService, TypeOrmOrganizationTeamEmployeeRepository]
})
export class OrganizationTeamEmployeeModule { }
