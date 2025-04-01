import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RelationId } from 'typeorm';
import { PermissionsEnum, IRolePermission } from '@gauzy/contracts';
import { Role, TenantBaseEntity } from '../core/entities/internal';
import { ColumnIndex, MultiORMColumn, MultiORMEntity, MultiORMManyToOne } from './../core/decorators/entity';

@MultiORMEntity('role_permission')
export class RolePermission extends TenantBaseEntity implements IRolePermission {
	@ApiProperty({ type: () => String, enum: PermissionsEnum })
	@ColumnIndex()
	@MultiORMColumn()
	permission: string;

	@ApiPropertyOptional({ type: () => Boolean, default: false })
	@MultiORMColumn({ nullable: true, default: false })
	enabled: boolean;

	@ApiPropertyOptional({ type: () => String })
	@MultiORMColumn({ nullable: true })
	description: string;

	/*
	|--------------------------------------------------------------------------
	| @ManyToOne
	|--------------------------------------------------------------------------
	*/
	@MultiORMManyToOne(() => Role, (it) => it.rolePermissions, {
		onDelete: 'CASCADE'
	})
	role: Role;

	@ApiProperty({ type: () => String })
	@RelationId((it: RolePermission) => it.role)
	@ColumnIndex()
	@MultiORMColumn({ relationId: true })
	roleId: string;
}
