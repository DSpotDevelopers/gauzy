import { BadRequestException, Injectable, NotFoundException, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ID, ISubscription, ISubscriptionCreateInput, ISubscriptionFindInput } from '@gauzy/contracts';
import { TenantAwareCrudService } from './../core/crud';
import { RequestContext } from '../core/context';
import { Subscription } from './subscription.entity';
import { TypeOrmSubscriptionRepository } from './repository';
import { DeleteResult } from 'typeorm';
import { Logger } from '../logger';

@Injectable()
export class SubscriptionService extends TenantAwareCrudService<Subscription> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(Subscription)
		private readonly typeOrmSubscriptionRepository: TypeOrmSubscriptionRepository
	) {
		super(typeOrmSubscriptionRepository);
	}

	/**
	 * Creates a new subscription for the specified entity and user.
	 *
	 * @param {ISubscriptionCreateInput} input - The input object containing subscription details, including the entity type, entity ID, and optional tenant ID.
	 * @returns {Promise<ISubscription>} A promise resolving to the created subscription, or the existing subscription if it already exists.
	 * @throws {BadRequestException} Throws a BadRequestException if the subscription creation fails due to an error.
	 */
	async create(input: ISubscriptionCreateInput): Promise<ISubscription> {
		try {
			const userId = input.userId || RequestContext.currentUserId();
			const tenantId = RequestContext.currentTenantId() || input.tenantId;

			const { entity, entityId } = input;

			// Check if the subscription already exists
			try {
				const existingSubscription = await this.findOneByOptions({
					where: { userId, entity, entityId, tenantId }
				});
				if (existingSubscription) {
					return existingSubscription;
				}
			} catch (e) {
				// If NotFoundException, continue with subscription creation
				if (!(e instanceof NotFoundException)) {
					throw e;
				}
			}

			// Create a new subscription if none exists
			const subscription = await super.create({ ...input, tenantId, userId });

			/**
			 * TODO : Optional subscription notification if needed
			 */

			return subscription;
		} catch (error) {
			this.logger.error(`Error creating subscription: ${error}`);
			throw new BadRequestException('Failed to create subscription', error);
		}
	}

	/**
	 * Unsubscribes a user from a specific entity by deleting the corresponding subscription.
	 *
	 * @param {ID} id - The unique identifier of the subscription to delete.
	 * @param {ISubscriptionFindInput} options - Additional options to refine the deletion query.
	 *   - `entity`: The type of entity the subscription is associated with (e.g., "project").
	 *   - `entityId`: The unique identifier of the associated entity.
	 * @returns {Promise<DeleteResult>} A promise that resolves to the result of the delete operation.
	 *
	 * @throws {BadRequestException} Throws an exception if an error occurs during the unsubscribe process.
	 */
	async unsubscribe(id: ID, options?: ISubscriptionFindInput): Promise<DeleteResult> {
		try {
			const { entity, entityId } = options || {};
			const userId = RequestContext.currentUserId();
			return await super.delete({ id, userId, entity, entityId });
		} catch (error) {
			this.logger.error(`Error while unsubscribing from entity: ${error}`);
			throw new BadRequestException('Failed to unsubscribe from entity', error);
		}
	}
}
