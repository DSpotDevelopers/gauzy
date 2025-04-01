import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { GoalTemplate } from './goal-template.entity';
import { TypeOrmGoalTemplateRepository } from './repository';

@Injectable()
export class GoalTemplateService extends TenantAwareCrudService<GoalTemplate> {
	constructor(
		@InjectRepository(GoalTemplate)
		private readonly typeOrmGoalTemplateRepository: TypeOrmGoalTemplateRepository
	) {
		super(typeOrmGoalTemplateRepository);
	}
}
