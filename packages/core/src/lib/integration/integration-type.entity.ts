import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Unique } from 'typeorm';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { IIntegration, IIntegrationType } from '@gauzy/contracts';
import { BaseEntity, Integration } from '../core/entities/internal';
import { MultiORMColumn, MultiORMEntity, MultiORMManyToMany } from './../core/decorators/entity';

@MultiORMEntity('integration_type')
@Unique(['name'])
export class IntegrationType extends BaseEntity implements IIntegrationType {
	@ApiProperty({ type: () => String })
	@IsNotEmpty()
	@MultiORMColumn()
	name: string;

	@ApiPropertyOptional({ type: () => String })
	@IsOptional()
	@MultiORMColumn({ nullable: true })
	description: string;

	@ApiPropertyOptional({ type: () => String })
	@IsOptional()
	@MultiORMColumn({ nullable: true })
	icon: string;

	@ApiProperty({ type: () => String })
	@IsNotEmpty()
	@MultiORMColumn()
	groupName: string;

	@ApiProperty({ type: () => Number })
	@IsNotEmpty()
	@IsNumber()
	@MultiORMColumn()
	order: number;

	/*
	|--------------------------------------------------------------------------
	| @ManyToMany
	|--------------------------------------------------------------------------
	*/
	@MultiORMManyToMany(() => Integration, (it) => it.integrationTypes, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	integrations: IIntegration[];
}
