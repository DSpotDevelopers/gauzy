import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';
import { IImportRecord } from '@gauzy/contracts';
import { MultiORMColumn, MultiORMEntity } from './../../core/decorators/entity';
import { TenantBaseEntity } from '../../core/entities/internal';

@MultiORMEntity('import-record')
export class ImportRecord extends TenantBaseEntity implements IImportRecord {
	@ApiProperty({ type: () => String })
	@MultiORMColumn({ nullable: false })
	entityType: string;

	@ApiProperty({ type: () => String })
	@MultiORMColumn({ nullable: false, type: 'uuid' })
	sourceId: string;

	@ApiProperty({ type: () => String })
	@MultiORMColumn({ nullable: false, type: 'uuid' })
	destinationId: string;

	@ApiProperty({ type: () => Date })
	@IsDate()
	@MultiORMColumn({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
	importDate?: Date;

	/** Additional virtual columns */
	wasCreated?: boolean;
}
