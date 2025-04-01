import { ApiProperty } from '@nestjs/swagger';
import { ITenant } from '@gauzy/contracts';
import { TenantBaseEntity } from '../../core/entities/internal';
import { MultiORMColumn, MultiORMEntity } from '../../core/decorators/entity';

@MultiORMEntity('tenant_setting')
export class TenantSetting extends TenantBaseEntity implements ITenant {
	@ApiProperty({ type: () => String })
	@MultiORMColumn({ nullable: false })
	name?: string;

	@ApiProperty({ type: () => String })
	@MultiORMColumn({ nullable: true })
	value?: string;
}
