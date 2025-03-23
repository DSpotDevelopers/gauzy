import { IGoalGeneralSetting, GoalOwnershipEnum } from '@gauzy/contracts';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TenantOrganizationBaseEntity } from '../core/entities/internal';
import { MultiORMColumn, MultiORMEntity } from './../core/decorators/entity';

@MultiORMEntity('goal_general_setting')
export class GoalGeneralSetting extends TenantOrganizationBaseEntity implements IGoalGeneralSetting {
	@ApiProperty({ type: () => Number })
	@MultiORMColumn()
	maxObjectives: number;

	@ApiProperty({ type: () => Number })
	@MultiORMColumn()
	maxKeyResults: number;

	@ApiProperty({ type: () => Boolean })
	@MultiORMColumn()
	employeeCanCreateObjective: boolean;

	@ApiProperty({ type: () => String, enum: GoalOwnershipEnum })
	@IsEnum(GoalOwnershipEnum)
	@MultiORMColumn()
	canOwnObjectives: string;

	@ApiProperty({ type: () => String, enum: GoalOwnershipEnum })
	@IsEnum(GoalOwnershipEnum)
	@MultiORMColumn()
	canOwnKeyResult: string;

	@ApiProperty({ type: () => Boolean })
	@MultiORMColumn()
	krTypeKPI: boolean;

	@ApiProperty({ type: () => Boolean })
	@MultiORMColumn()
	krTypeTask: boolean;
}
