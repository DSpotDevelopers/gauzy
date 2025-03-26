import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { GoalKPITemplate } from './goal-kpi-template.entity';
import { TypeOrmGoalKPITemplateRepository } from './repository';

@Injectable()
export class GoalKpiTemplateService extends TenantAwareCrudService<GoalKPITemplate> {
	constructor(
		@InjectRepository(GoalKPITemplate)
		private readonly typeOrmGoalKPITemplateRepository: TypeOrmGoalKPITemplateRepository
	) {
		super(typeOrmGoalKPITemplateRepository);
	}
}
