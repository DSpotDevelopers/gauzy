import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GoalTimeFrame } from './goal-time-frame.entity';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmGoalTimeFrameRepository } from './repository';

@Injectable()
export class GoalTimeFrameService extends TenantAwareCrudService<GoalTimeFrame> {
	constructor(
		@InjectRepository(GoalTimeFrame)
		private readonly typeOrmGoalTimeFrameRepository: TypeOrmGoalTimeFrameRepository
	) {
		super(typeOrmGoalTimeFrameRepository);
	}
}
