import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RelationId } from 'typeorm';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ISocialAccount, IUser, ProviderEnum } from '@gauzy/contracts';
import { TenantBaseEntity, User } from '../../core/entities/internal';
import { ColumnIndex, MultiORMColumn, MultiORMEntity, MultiORMManyToOne } from '../../core/decorators/entity';

@MultiORMEntity('social_account')
export class SocialAccount extends TenantBaseEntity implements ISocialAccount {
	@ApiProperty({ type: () => String })
	@IsNotEmpty()
	@IsEnum(ProviderEnum, { message: 'provider `$value` must be a valid enum value' })
	@MultiORMColumn()
	provider: ProviderEnum;

	@ApiProperty({ type: () => String })
	@IsNotEmpty()
	@IsString()
	@MultiORMColumn()
	providerAccountId: string;

	/*
	|--------------------------------------------------------------------------
	| @ManyToOne
	|--------------------------------------------------------------------------
	*/

	/**
	 * User
	 */
	@MultiORMManyToOne(() => User, {
		/** Database cascade action on delete. */
		onDelete: 'CASCADE'
	})
	user?: IUser;

	@ApiPropertyOptional({ type: () => String })
	@IsOptional()
	@IsUUID()
	@RelationId((it: SocialAccount) => it.user)
	@ColumnIndex()
	@MultiORMColumn({ relationId: true })
	userId?: IUser['id'];
}
