import { RelationId, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IKeyResult, IKeyResultUpdate, KeyResultUpdateStatusEnum } from '@gauzy/contracts';
import { KeyResult, TenantOrganizationBaseEntity } from '../core/entities/internal';
import { MultiORMColumn, MultiORMEntity, MultiORMManyToOne } from './../core/decorators/entity';

@MultiORMEntity('key_result_update')
export class KeyResultUpdate extends TenantOrganizationBaseEntity implements IKeyResultUpdate {
	@ApiProperty({ type: () => Number })
	@MultiORMColumn()
	update: number;

	@ApiProperty({ type: () => Number })
	@MultiORMColumn()
	progress: number;

	@ApiProperty({ type: () => String })
	@MultiORMColumn()
	owner: string;

	@ApiProperty({ type: () => String, enum: KeyResultUpdateStatusEnum })
	@IsEnum(KeyResultUpdateStatusEnum)
	@MultiORMColumn()
	status: string;

	/*
	|--------------------------------------------------------------------------
	| @ManyToOne
	|--------------------------------------------------------------------------
	*/
	@MultiORMManyToOne(() => KeyResult, (it) => it.updates, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	keyResult?: IKeyResult;

	@ApiProperty({ type: () => String, readOnly: true })
	@RelationId((it: KeyResultUpdate) => it.keyResult)
	@MultiORMColumn({ nullable: true, relationId: true })
	keyResultId?: IKeyResult['id'];
}
