import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmEmployeeAwardRepository } from './repository';
import { EmployeeAward } from './employee-award.entity';

@Injectable()
export class EmployeeAwardService extends TenantAwareCrudService<EmployeeAward> {
	constructor(
		@InjectRepository(EmployeeAward)
		private readonly typeOrmEmployeeAwardRepository: TypeOrmEmployeeAwardRepository
	) {
		super(typeOrmEmployeeAwardRepository);
	}
}
