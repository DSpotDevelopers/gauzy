import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GoalGeneralSetting } from './goal-general-setting.entity';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmGoalGeneralSettingRepository } from './repository';

@Injectable()
export class GoalGeneralSettingService extends TenantAwareCrudService<GoalGeneralSetting> {
	constructor(
		@InjectRepository(GoalGeneralSetting)
		private readonly typeOrmGoalGeneralSettingRepository: TypeOrmGoalGeneralSettingRepository
	) {
		super(typeOrmGoalGeneralSettingRepository);
	}
}
