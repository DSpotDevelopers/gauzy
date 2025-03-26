import { BadRequestException, Injectable, NotFoundException, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, FindOptionsWhere, UpdateResult } from 'typeorm';
import { ID, IReaction, IReactionCreateInput, IReactionUpdateInput } from '@gauzy/contracts';
import { TenantAwareCrudService } from './../core/crud';
import { RequestContext } from '../core/context';
import { UserService } from '../user/user.service';
import { Reaction } from './reaction.entity';
import { TypeOrmReactionRepository } from './repository';
import { Logger } from '../logger';
@Injectable()
export class ReactionService extends TenantAwareCrudService<Reaction> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(Reaction)
		private readonly typeOrmReactionRepository: TypeOrmReactionRepository,

		private readonly userService: UserService
	) {
		super(typeOrmReactionRepository);
	}

	/**
	 * @description Create reaction
	 * @param {IReactionCreateInput} input - Data to creating reaction
	 * @returns A promise that resolves to the created reaction
	 * @memberof ReactionService
	 */
	async create(input: IReactionCreateInput): Promise<IReaction> {
		try {
			const { entity, entityId, emoji, organizationId } = input;
			const userId = RequestContext.currentUserId();
			const tenantId = RequestContext.currentTenantId();

			// Employee existence validation
			const user = await this.userService.findOneByIdString(userId);
			if (!user) {
				throw new NotFoundException('User not found');
			}

			// Check for exiting favorite element to toggle and remove reaction
			const findOptions: FindOptionsWhere<Reaction> = {
				tenantId,
				organizationId,
				emoji,
				creatorId: user.id,
				entity,
				entityId
			};
			const existingReaction = await this.typeOrmRepository.findOneBy(findOptions);

			if (existingReaction) {
				await super.delete(findOptions);
				return;
			}

			// return created reaction
			return await super.create({
				...input,
				tenantId,
				creatorId: user.id
			});
		} catch (error) {
			this.logger.error(`Error while creating reaction: ${error}`);
			throw new BadRequestException('Reaction post failed', error);
		}
	}

	/**
	 * @description Update reaction - Note
	 * @param {IReactionUpdateInput} input - Data to update reaction
	 * @returns A promise that resolves to the updated reaction OR Update result
	 * @memberof ReactionService
	 */
	async update(id: ID, input: IReactionUpdateInput): Promise<IReaction | UpdateResult> {
		try {
			const userId = RequestContext.currentUserId();
			const reaction = await this.findOneByOptions({
				where: {
					id,
					creatorId: userId
				}
			});

			if (!reaction) {
				throw new BadRequestException('reaction not found');
			}

			return await super.create({
				...input,
				id
			});
		} catch (error) {
			this.logger.error(`Error while updating reaction: ${error}`);
			throw new BadRequestException('reaction update failed', error);
		}
	}

	async delete(id: ID): Promise<DeleteResult> {
		try {
			const userId = RequestContext.currentUserId();
			return await super.delete(id, {
				where: { creatorId: userId }
			});
		} catch (error) {
			this.logger.error(`Error while deleting reaction: ${error}`);
			throw new BadRequestException(error);
		}
	}
}
