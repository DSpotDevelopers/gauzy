import { HttpException, HttpStatus, Injectable, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOneOptions } from 'typeorm';
import { ID } from '@gauzy/contracts';
import { RequestContext } from '../core/context';
import { TenantAwareCrudService } from './../core/crud';
import { Deal } from './deal.entity';
import { TypeOrmDealRepository } from './repository';
import { Logger } from '../logger';

@Injectable()
export class DealService extends TenantAwareCrudService<Deal> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(Deal)
		private readonly typeOrmDealRepository: TypeOrmDealRepository
	) {
		super(typeOrmDealRepository);
	}

	/**
	 * Find a Pipeline by ID
	 *
	 * @param id - The ID of the Pipeline to find
	 * @param relations - Optional relations to include in the query
	 * @returns The found Pipeline
	 */
	async findById(id: ID, options?: FindOneOptions<Deal>): Promise<Deal> {
		return await super.findOneByIdString(id, options);
	}

	/**
	 * Creates a new deal entity.
	 *
	 * This method sets the `createdByUserId` using the current user's ID from the request context,
	 * then calls the create method on the superclass (likely a service or repository) with the modified entity data.
	 *
	 * @param entity - The partial deal entity data to create.
	 * @returns A promise that resolves to the created deal entity.
	 */
	async create(entity: DeepPartial<Deal>): Promise<Deal> {
		try {
			// Set the createdByUserId using the current user's ID from the request context
			entity.createdByUserId = RequestContext.currentUserId();

			// Call the create method on the superclass with the modified entity data
			return await super.create(entity);
		} catch (error) {
			// Handle any errors that occur during deal creation
			this.logger.error(`Error occurred while creating deal: ${error.message}`);
			throw new HttpException(`Error occurred while creating deal: ${error.message}`, HttpStatus.BAD_REQUEST);
		}
	}
}
