import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Goal } from './goal.entity';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmGoalRepository } from './repository';

@Injectable()
export class GoalService extends TenantAwareCrudService<Goal> {
	constructor(
		@InjectRepository(Goal)
		private readonly typeOrmGoalRepository: TypeOrmGoalRepository
	) {
		super(typeOrmGoalRepository);
	}
}
