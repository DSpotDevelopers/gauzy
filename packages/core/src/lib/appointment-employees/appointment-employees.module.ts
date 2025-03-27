import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { AppointmentEmployee } from './appointment-employees.entity';
import { AppointmentEmployeesController } from './appointment-employees.controller';
import { AppointmentEmployeesService } from './appointment-employees.service';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
	imports: [
		RouterModule.register([
			{
				path: '/appointment-employees',
				module: AppointmentEmployeesModule
			}
		]),
		TypeOrmModule.forFeature([AppointmentEmployee]),
		RolePermissionModule
	],
	controllers: [AppointmentEmployeesController],
	providers: [AppointmentEmployeesService],
	exports: [AppointmentEmployeesService]
})
export class AppointmentEmployeesModule { }
