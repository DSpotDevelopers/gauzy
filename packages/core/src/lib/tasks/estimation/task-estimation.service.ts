import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEstimation } from './task-estimation.entity';
import { TenantAwareCrudService } from '../../core/crud';
import { TypeOrmTaskEstimationRepository } from './repository';

@Injectable()
export class TaskEstimationService extends TenantAwareCrudService<TaskEstimation> {
	constructor(
		@InjectRepository(TaskEstimation)
		private readonly typeOrmTaskEstimationRepository: TypeOrmTaskEstimationRepository
	) {
		super(typeOrmTaskEstimationRepository);
	}
}
