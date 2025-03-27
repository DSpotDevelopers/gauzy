import { ApiProperty } from '@nestjs/swagger';
import { IEmailTemplate } from '@gauzy/contracts';
import { isMySQL } from '@gauzy/config';
import { TenantOrganizationBaseEntity } from '../core/entities/internal';
import { ColumnIndex, MultiORMColumn, MultiORMEntity } from './../core/decorators/entity';

@MultiORMEntity('email_template')
export class EmailTemplate extends TenantOrganizationBaseEntity implements IEmailTemplate {
	@ApiProperty({ type: () => String })
	@ColumnIndex()
	@MultiORMColumn()
	name: string;

	@ApiProperty({ type: () => String })
	@ColumnIndex()
	@MultiORMColumn()
	languageCode: string;

	@ApiProperty({ type: () => String })
	@MultiORMColumn({ type: 'text', nullable: true })
	mjml: string;

	@ApiProperty({ type: () => String })
	@MultiORMColumn({ ...(isMySQL() ? { type: 'longtext' } : {}) })
	hbs: string;

	/** Additional virtual columns */
	title?: string;

	/*
	|--------------------------------------------------------------------------
	| @OneToMany
	|--------------------------------------------------------------------------
	*/
}
