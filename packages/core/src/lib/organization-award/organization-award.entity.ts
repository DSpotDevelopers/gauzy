import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IOrganizationAward } from '@gauzy/contracts';
import { TenantOrganizationBaseEntity } from '../core/entities/internal';
import { ColumnIndex, MultiORMColumn, MultiORMEntity } from './../core/decorators/entity';

@MultiORMEntity('organization_award')
export class OrganizationAward extends TenantOrganizationBaseEntity implements IOrganizationAward {
	@ApiProperty({ type: () => String })
	@IsString()
	@IsNotEmpty()
	@ColumnIndex()
	@MultiORMColumn()
	name: string;

	@ApiProperty({ type: () => String })
	@IsString()
	@IsNotEmpty()
	@MultiORMColumn()
	year: string;
}
