import { ICurrency } from '@gauzy/contracts';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity } from '../core/entities/internal';
import { ColumnIndex, MultiORMColumn, MultiORMEntity } from './../core/decorators/entity';

@MultiORMEntity('currency')
export class Currency extends BaseEntity implements ICurrency {
	@ApiProperty({ type: () => String })
	@ColumnIndex()
	@IsString()
	@IsNotEmpty()
	@MultiORMColumn({ nullable: false })
	isoCode: string;

	@ApiProperty({ type: () => String })
	@IsString()
	@IsNotEmpty()
	@MultiORMColumn({ nullable: false })
	currency: string;
}
