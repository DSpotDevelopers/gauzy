import { ApiProperty } from '@nestjs/swagger';
import { JoinColumn, RelationId } from 'typeorm';
import { IIntegrationMap, IIntegrationTenant, IntegrationEntity } from '@gauzy/contracts';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { IntegrationTenant, TenantOrganizationBaseEntity } from '../core/entities/internal';
import { ColumnIndex, MultiORMColumn, MultiORMEntity, MultiORMManyToOne } from './../core/decorators/entity';

@MultiORMEntity('integration_map')
export class IntegrationMap extends TenantOrganizationBaseEntity implements IIntegrationMap {
	@ApiProperty({ type: () => String, enum: IntegrationEntity })
	@IsNotEmpty()
	@MultiORMColumn()
	entity: IntegrationEntity;

	@ApiProperty({ type: () => String })
	@IsNotEmpty()
	@MultiORMColumn()
	sourceId: string;

	@ApiProperty({ type: () => String })
	@IsNotEmpty()
	@IsUUID()
	@MultiORMColumn()
	gauzyId: string;

	/*
	|--------------------------------------------------------------------------
	| @ManyToOne
	|--------------------------------------------------------------------------
	*/
	@ApiProperty({ type: () => IntegrationTenant })
	@MultiORMManyToOne(() => IntegrationTenant, (it) => it.entityMaps, {
		/** Database cascade action on delete. */
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	integration: IIntegrationTenant;

	@ApiProperty({ type: () => String })
	@IsUUID()
	@RelationId((it: IntegrationMap) => it.integration)
	@ColumnIndex()
	@MultiORMColumn({ relationId: true })
	integrationId: IIntegrationTenant['id'];
}
