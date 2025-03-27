// Modified code from https://github.com/xmlking/ngx-starter-kit.
// Original license: MIT License, see https://github.com/xmlking/ngx-starter-kit/blob/develop/LICENSE
// Original copyright: Copyright (c) 2018 Sumanth Chinthagunta

import { BadRequestException, NotFoundException, Logger as NestLogger } from '@nestjs/common';
import {
	DeepPartial,
	DeleteResult,
	FindManyOptions,
	FindOneOptions,
	FindOptionsWhere,
	Repository,
	SaveOptions,
	UpdateResult
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { IPagination } from '@gauzy/contracts';
import { BaseEntity } from '../entities/internal';
import { TypeOrmQueryBuilder } from '../orm/query-builder/typeorm-query-builder';
import { IQueryBuilder } from '../orm/query-builder/iquery-builder';
import { parseTypeORMFindCountOptions } from './utils';
import {
	ICountByOptions,
	ICountOptions,
	ICrudService,
	IFindManyOptions,
	IFindOneOptions,
	IFindWhereOptions,
	IPartialEntity,
	IUpdateCriteria
} from './icrud.service';
import { ITryRequest } from './try-request';
import { Logger } from '../../logger';

export abstract class CrudService<T extends BaseEntity> implements ICrudService<T> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(protected readonly typeOrmRepository: Repository<T>) { }

	/**
	 * Get the table name from the repository metadata.
	 * @returns {string} The table name.
	 */
	public get tableName(): string {
		return this.typeOrmRepository.metadata.tableName;
	}

	/**
	 * Creates a query builder for the repository.
	 *
	 * @param alias - Optional alias for the primary table in the query.
	 * @returns An `IQueryBuilder<T>` instance suitable for the repository's ORM type.
	 * @throws Error if the ORM type is not implemented.
	 */
	public createQueryBuilder(alias?: string): IQueryBuilder<T> {
		return new TypeOrmQueryBuilder(this.typeOrmRepository as Repository<T>)
	}

	/**
	 * Count the number of entities based on the provided options.
	 *
	 * @param options - Options for counting entities.
	 * @returns A Promise that resolves to the count of entities.
	 */
	public async count(options?: ICountOptions<T>): Promise<number> {
		const typeormOptions = parseTypeORMFindCountOptions<T>(options as FindManyOptions);
		return await this.typeOrmRepository.count(typeormOptions as FindManyOptions);
	}

	/**
	 * Counts entities that match given options.
	 * Useful for pagination.
	 *
	 * @param options
	 * @returns
	 */
	public async countBy(options?: ICountByOptions<T>): Promise<number> {
		const typeormOptions = parseTypeORMFindCountOptions<T>({ where: options } as FindManyOptions);
		return await this.typeOrmRepository.count(typeormOptions as FindManyOptions);
	}

	/**
	 * Finds entities that match given find options.
	 * Also counts all entities that match given conditions,
	 * but ignores pagination settings (from and take options).
	 *
	 * @param options
	 * @returns
	 */
	public async findAll(options?: IFindManyOptions<T>): Promise<IPagination<T>> {
		const [items, total] = await this.typeOrmRepository.findAndCount(options as FindManyOptions<T>);
		return { items, total };
	}

	/**
	 * Finds entities that match given find options.
	 *
	 * @param options
	 * @returns
	 */
	public async find(options?: IFindManyOptions<T>): Promise<T[]> {
		return await this.typeOrmRepository.find(options as FindManyOptions<T>);
	}

	/**
	 * Finds entities that match given find options.
	 * Also counts all entities that match given conditions,
	 * But includes pagination settings
	 *
	 * @param options
	 * @returns
	 */
	public async paginate(options?: FindManyOptions<T>): Promise<IPagination<T>> {
		try {
			const [items, total] = await this.typeOrmRepository.findAndCount({
				skip: options?.skip ? options.take * (options.skip - 1) : 0,
				take: options?.take ? options.take : 10,
				/**
				 * Specifies what relations should be loaded.
				 *
				 * @deprecated
				 */
				...(options?.join ? { join: options.join } : {}),
				...(options?.select ? { select: options.select } : {}),
				...(options?.relations ? { relations: options.relations } : {}),
				...(options?.where ? { where: options.where } : {}),
				...(options?.order ? { order: options.order } : {})
			});
			return { items, total };
		} catch (error) {
			this.logger.error(`Paginate error: ${error}`);
			throw new BadRequestException(error);
		}
	}

	/*
	|--------------------------------------------------------------------------
	| @FindOneOrFail
	|--------------------------------------------------------------------------
	*/

	/**
	 * Finds first entity by a given find options.
	 * If entity was not found in the database - rejects with error.
	 *
	 * @param id
	 * @param options
	 * @returns
	 */
	public async findOneOrFailByIdString(id: string, options?: IFindOneOptions<T>): Promise<ITryRequest<T>> {
		try {
			options = options as FindOneOptions<T>;
			const record = await this.typeOrmRepository.findOneOrFail({
				where: {
					id,
					...(options?.where ? options.where : {})
				},
				...(options?.select ? { select: options.select } : {}),
				...(options?.relations ? { relations: options.relations } : []),
				...(options?.order ? { order: options.order } : {})
			} as FindOneOptions<T>);
			return {
				success: true,
				record: this.serialize(record)
			};
		} catch (error) {
			return {
				success: false,
				error
			};
		}
	}

	/**
	 * Finds first entity by a given find options.
	 * If entity was not found in the database - rejects with error.
	 *
	 * @param options
	 * @returns
	 */
	public async findOneOrFailByOptions(options: IFindOneOptions<T>): Promise<ITryRequest<T>> {
		try {
			const record = await this.typeOrmRepository.findOneOrFail(options as FindOneOptions<T>);
			return {
				success: true,
				record: this.serialize(record)
			};
		} catch (error) {
			return {
				success: false,
				error
			};
		}
	}

	/**
	 * Finds first entity that matches given where condition.
	 * If entity was not found in the database - rejects with error.
	 *
	 * @param options
	 * @returns
	 */
	public async findOneOrFailByWhereOptions(options: IFindWhereOptions<T>): Promise<ITryRequest<T>> {
		try {
			const record = await this.typeOrmRepository.findOneByOrFail(options as FindOptionsWhere<T>);
			return {
				success: true,
				record: this.serialize(record)
			};
		} catch (error) {
			return {
				success: false,
				error
			};
		}
	}

	/*
	|--------------------------------------------------------------------------
	| @FindOne
	|--------------------------------------------------------------------------
	*/
	/**
	 * Finds first entity by a given find options.
	 * If entity was not found in the database - returns null.
	 *
	 * @param id {string}
	 * @param options
	 * @returns
	 */
	public async findOneByIdString(id: T['id'], options?: IFindOneOptions<T>): Promise<T> {
		options = options as FindOneOptions<T>;
		const record = await this.typeOrmRepository.findOne({
			where: {
				id,
				...(options?.where ? options.where : {})
			},
			...(options?.select ? { select: options.select } : {}),
			...(options?.relations ? { relations: options.relations } : []),
			...(options?.order ? { order: options.order } : {}),
			...(options?.withDeleted ? { withDeleted: options.withDeleted } : {})
		} as FindOneOptions<T>);
		if (!record) {
			throw new NotFoundException(`The requested record was not found`);
		}

		return this.serialize(record);
	}

	/**
	 * Finds first entity by a given find options.
	 * If entity was not found in the database - returns null.
	 *
	 * @param options
	 * @returns
	 */
	public async findOneByOptions(options: IFindOneOptions<T>): Promise<T | null> {
		const record = await this.typeOrmRepository.findOne(options as FindOneOptions<T>);
		if (!record) {
			throw new NotFoundException(`The requested record was not found`);
		}

		return this.serialize(record);
	}

	/**
	 * Finds first entity that matches given where condition.
	 * If entity was not found in the database - returns null.
	 *
	 * @param options
	 * @returns
	 */
	public async findOneByWhereOptions(options: IFindWhereOptions<T>): Promise<T | null> {
		const record = await this.typeOrmRepository.findOneBy(options as FindOptionsWhere<T>);
		if (!record) {
			throw new NotFoundException(`The requested record was not found`);
		}
		return this.serialize(record);
	}

	/**
	 * Creates a new entity or updates an existing one based on the provided entity data.
	 *
	 * @param entity The partial entity data for creation or update.
	 * @param createOptions Options for the creation of the entity.
	 * @param upsertOptions Options for the upsert operation.
	 * @returns The created or updated entity.
	 */
	public async create(partialEntity: IPartialEntity<T>): Promise<T> {
		try {
			const newEntity = this.typeOrmRepository.create(partialEntity as DeepPartial<T>);
			return await this.typeOrmRepository.save(newEntity);
		} catch (error) {
			this.logger.error(`Error in crud service create method: ${error}`);
			throw new BadRequestException(error);
		}
	}

	/**
	 * Saves a given entity in the database.
	 * If entity does not exist in the database then inserts, otherwise updates.
	 *
	 * @param entity
	 * @returns
	 */
	public async save(entity: IPartialEntity<T>): Promise<T> {
		try {
			return await this.typeOrmRepository.save(entity as DeepPartial<T>);
		} catch (error) {
			this.logger.error(`Error in crud service save method: ${error}`);
			throw new BadRequestException(error);
		}
	}

	/**
	 * Updates entity partially. Entity can be found by a given conditions.
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient UPDATE query.
	 * Does not check if entity exist in the database.
	 *
	 * @param id
	 * @param partialEntity
	 * @returns
	 */
	public async update(id: IUpdateCriteria<T>, partialEntity: QueryDeepPartialEntity<T>): Promise<UpdateResult | T> {
		try {
			return await this.typeOrmRepository.update(id as string | number | FindOptionsWhere<T>, partialEntity);
		} catch (error) {
			throw new BadRequestException(error);
		}
	}

	/**
	 * Deletes a record based on the given criteria.
	 * Criteria can be an ID (string or number) or a complex object with conditions.
	 * Supports multiple ORM types, and throws if the ORM type is unsupported.
	 *
	 * @param criteria - Identifier or condition to delete specific record(s).
	 * @returns {Promise<DeleteResult>} - Result indicating the number of affected records.
	 */
	public async delete(criteria: string | number | FindOptionsWhere<T>): Promise<DeleteResult> {
		try {
			return await this.typeOrmRepository.delete(criteria);
		} catch (error) {
			throw new NotFoundException(`The record was not found`, error);
		}
	}

	/**
	 * Softly deletes entities by a given criteria.
	 * This method sets a flag or timestamp indicating the entity is considered deleted.
	 * It does not actually remove the entity from the database, allowing for recovery or audit purposes.
	 *
	 * @param criteria - Entity ID or condition to identify which entities to soft-delete.
	 * @param options - Additional options for the operation.
	 * @returns {Promise<UpdateResult | DeleteResult>} - Result indicating success or failure.
	 */
	public async softDelete(criteria: string | number | FindOptionsWhere<T>): Promise<UpdateResult | T> {
		try {
			// Perform soft delete using TypeORM
			return await this.typeOrmRepository.softDelete(criteria);
		} catch (error) {
			throw new NotFoundException(`The record was not found or could not be soft-deleted`, error);
		}
	}

	/**
	 * Softly removes an entity from the database.
	 *
	 * This method handles soft removal of a given entity using different ORM strategies, based on the configured ORM type.
	 * - For TypeORM, it utilizes the `softRemove` method to perform a soft deletion.
	 * If the ORM type is not supported, an error is thrown.
	 *
	 * @param id - The unique identifier of the entity to be softly removed.
	 * @param options - Optional parameters for finding the entity (commonly used with TypeORM).
	 * @param saveOptions - Additional save options for the ORM operation (specific to TypeORM).
	 * @returns A promise that resolves to the softly removed entity.
	 */
	public async softRemove(id: T['id'], options?: IFindOneOptions<T>, saveOptions?: SaveOptions): Promise<T> {
		try {
			// Ensure the employee exists before attempting soft deletion
			const entity = await this.findOneByIdString(id, options);
			// TypeORM soft removes entities via its repository
			return await this.typeOrmRepository.softRemove<T>(entity, saveOptions);
		} catch (error) {
			// If any error occurs, rethrow it as a NotFoundException with additional context.
			throw new NotFoundException(`An error occurred during soft removal: ${error.message}`, error);
		}
	}

	/**
	 * Soft-recover a previously soft-deleted entity.
	 *
	 * Depending on the ORM, this method restores a soft-deleted entity by resetting its deletion indicator.
	 *
	 * @param entity - The soft-deleted entity to recover.
	 * @param options - Optional settings for database save operations.
	 * @returns A promise that resolves with the recovered entity.
	 */
	public async softRecover(id: T['id'], options?: IFindOneOptions<T>, saveOptions?: SaveOptions): Promise<T> {
		try {
			// Ensure the entity exists before attempting soft recover
			const entity = await this.findOneByIdString(id, options);
			// Use TypeORM's recover method to restore the entity
			return await this.typeOrmRepository.recover(entity, saveOptions);
		} catch (error) {
			// If any error occurs, rethrow it as a NotFoundException with additional context.
			throw new NotFoundException(`An error occurred during restoring entity: ${error.message}`);
		}
	}

	/**
	 * Serializes the provided entity based on the ORM type.
	 * @param entity The entity to be serialized.
	 * @returns The serialized entity.
	 */
	protected serialize(entity: T): T {
		// If using other ORM types, return the entity as is
		return entity;
	}
}
