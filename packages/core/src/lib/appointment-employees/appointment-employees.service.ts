import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud/tenant-aware-crud.service';
import { TypeOrmAppointmentEmployeeRepository } from './repository';
import { AppointmentEmployee } from './appointment-employees.entity';

@Injectable()
export class AppointmentEmployeesService extends TenantAwareCrudService<AppointmentEmployee> {
	constructor(
		@InjectRepository(AppointmentEmployee)
		private readonly typeOrmAppointmentEmployeeRepository: TypeOrmAppointmentEmployeeRepository
	) {
		super(typeOrmAppointmentEmployeeRepository);
	}
}
