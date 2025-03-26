import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmEmployeeLevelRepository } from './repository';
import { EmployeeLevel } from './employee-level.entity';

@Injectable()
export class EmployeeLevelService extends TenantAwareCrudService<EmployeeLevel> {
	constructor(
		@InjectRepository(EmployeeLevel)
		private readonly typeOrmEmployeeLevelRepository: TypeOrmEmployeeLevelRepository
	) {
		super(typeOrmEmployeeLevelRepository);
	}
}
