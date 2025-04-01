import { BadRequestException, Injectable, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial } from 'typeorm';
import { ISocialAccount, ISocialAccountBase } from '@gauzy/contracts';
import { TenantAwareCrudService } from '../../core/crud';
import { SocialAccount } from './social-account.entity';
import { TypeOrmSocialAccountRepository } from './repository';
import { User, UserService } from '../../user';
import { Logger } from '../../logger';

@Injectable()
export class SocialAccountService extends TenantAwareCrudService<SocialAccount> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(SocialAccount)
		private readonly typeOrmSocialAccountRepository: TypeOrmSocialAccountRepository,

		private readonly userService: UserService
	) {
		super(typeOrmSocialAccountRepository);
	}

	async registerSocialAccount(partialEntity: DeepPartial<ISocialAccount>): Promise<ISocialAccount> {
		try {
			return await this.typeOrmRepository.save(partialEntity);
		} catch (error) {
			this.logger.error(`Error while registering social account: ${error}`);
			throw new BadRequestException('Could not create this account');
		}
	}

	async findAccountByProvider(input: ISocialAccountBase): Promise<SocialAccount> {
		const { provider, providerAccountId } = input;
		return await this.typeOrmRepository.findOne({
			where: { provider, providerAccountId, isActive: true, isArchived: false },
			relations: {
				user: true
			}
		});
	}

	async findUserBySocialId(input: ISocialAccountBase): Promise<User> {
		try {
			const account = await this.findAccountByProvider(input);
			const user = account?.user;
			if (!user) {
				throw new BadRequestException('The user with this account details does not exists');
			}
			return user;
		} catch (error) {
			this.logger.error(`Error while finding user by social id: ${error}`);
			throw new BadRequestException('The user with this account details does not exists');
		}
	}

	async signupFindUserByEmail(email: string): Promise<boolean> {
		const user = await this.userService.getUserByEmail(email);
		if (!user) return false;
		return true;
	}
}
