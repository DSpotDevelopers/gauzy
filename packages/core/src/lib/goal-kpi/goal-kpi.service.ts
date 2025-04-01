import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GoalKPI } from './goal-kpi.entity';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmGoalKPIRepository } from './repository';

@Injectable()
export class GoalKpiService extends TenantAwareCrudService<GoalKPI> {
	constructor(
		@InjectRepository(GoalKPI)
		private readonly typeOrmGoalKPIRepository: TypeOrmGoalKPIRepository
	) {
		super(typeOrmGoalKPIRepository);
	}
}
