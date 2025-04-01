import { ApiProperty } from '@nestjs/swagger';
import { AccountingTemplateTypeEnum, IAccountingTemplate } from '@gauzy/contracts';
import { isMySQL } from '@gauzy/config';
import { TenantOrganizationBaseEntity } from '../core/entities/internal';
import { ColumnIndex, MultiORMColumn, MultiORMEntity } from './../core/decorators/entity';

@MultiORMEntity('accounting_template')
export class AccountingTemplate extends TenantOrganizationBaseEntity implements IAccountingTemplate {
	@ApiProperty({ type: () => String })
	@ColumnIndex()
	@MultiORMColumn()
	name?: string;

	@ApiProperty({ type: () => String })
	@ColumnIndex()
	@MultiORMColumn()
	languageCode?: string;

	@ApiProperty({ type: () => String })
	@MultiORMColumn({ type: 'text', nullable: true })
	mjml?: string;

	@ApiProperty({ type: () => String })
	@MultiORMColumn({ ...(isMySQL() ? { type: 'longtext' } : {}) })
	hbs?: string;

	@ApiProperty({ type: () => String, enum: AccountingTemplateTypeEnum })
	@MultiORMColumn()
	templateType?: string;
}
