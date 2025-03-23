import { IGoalTimeFrame, TimeFrameStatusEnum } from '@gauzy/contracts';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TenantOrganizationBaseEntity } from '../core/entities/internal';
import { MultiORMColumn, MultiORMEntity } from './../core/decorators/entity';

@MultiORMEntity('goal_time_frame')
export class GoalTimeFrame extends TenantOrganizationBaseEntity implements IGoalTimeFrame {
	@ApiProperty({ type: () => String })
	@MultiORMColumn()
	name: string;

	@ApiProperty({ type: () => String, enum: TimeFrameStatusEnum })
	@IsEnum(TimeFrameStatusEnum)
	@MultiORMColumn()
	status: string;

	@ApiProperty({ type: () => Date })
	@MultiORMColumn()
	startDate: Date;

	@ApiProperty({ type: () => Date })
	@MultiORMColumn()
	endDate: Date;
}
