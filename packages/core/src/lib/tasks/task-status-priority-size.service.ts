import { Injectable, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmBaseEntityRepository, SelectQueryBuilder, IsNull, FindManyOptions } from 'typeorm';
import { isNotEmpty } from '@gauzy/common';
import {
	IIssueTypeFindInput,
	IPagination,
	ITaskPriorityFindInput,
	ITaskSizeFindInput,
	ITaskStatusFindInput,
	ITaskVersionFindInput
} from '@gauzy/contracts';
import { RequestContext } from '../core/context';
import { TenantAwareCrudService } from '../core/crud';
import { BaseEntity, TenantBaseEntity } from '../core/entities/internal';
import { prepareSQLQuery as p } from './../database/database.helper';
import { Logger } from '../logger';

export type FindEntityByParams =
	| ITaskStatusFindInput
	| ITaskPriorityFindInput
	| ITaskSizeFindInput
	| IIssueTypeFindInput
	| ITaskVersionFindInput;

@Injectable()
export class TaskStatusPrioritySizeService<
	BaseEntity extends TenantBaseEntity
> extends TenantAwareCrudService<BaseEntity> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(BaseEntity)
		private readonly typeOrmBaseEntityRepository: TypeOrmBaseEntityRepository<BaseEntity>
	) {
		super(typeOrmBaseEntityRepository);
	}

	/**
	 * Retrieves entities based on the provided parameters.
	 *
	 * @param params - Parameters for filtering (IFindEntityByParams).
	 * @returns A Promise that resolves to an object conforming to the IPagination interface.
	 */
	async fetchAll(params: FindEntityByParams): Promise<IPagination<BaseEntity>> {
		try {
			// Destructures the organizationId, projectId, and organizationTeamId from the provided parameters.
			const { organizationId, projectId, organizationTeamId } = params;

			// Convert the where clause to FindManyOptions<BaseEntity>
			const options: FindManyOptions<FindEntityByParams> = {
				// Construct the where clause based on parameters
				where: {
					tenantId: isNotEmpty(params.tenantId)
						? RequestContext.currentTenantId() || params.tenantId
						: IsNull(),
					organizationId: isNotEmpty(organizationId) ? organizationId : IsNull(),
					projectId: isNotEmpty(projectId) ? projectId : IsNull(),
					organizationTeamId: isNotEmpty(organizationTeamId) ? organizationTeamId : IsNull()
				}
			};

			// Retrieve entities and their count
			const [items, total] = await this.typeOrmRepository.findAndCount(options as FindManyOptions<BaseEntity>);

			// If no entities are found, fallback to default entities
			if (total === 0) {
				return await this.getDefaultEntities();
			}

			return { items, total };
		} catch (error) {
			this.logger.error(
				`No entities found matching the specified parameters ${JSON.stringify(params)}: ${error}`
			);
			// If an error occurs during the retrieval, fallback to default entities
			return await this.getDefaultEntities();
		}
	}

	/**
	 * Retrieves default entities based on certain criteria.
	 * @returns A promise resolving to an object containing items and total count.
	 */
	async getDefaultEntities(): Promise<IPagination<BaseEntity>> {
		try {
			// Convert the where clause to FindManyOptions<FindEntityByParams>
			const options: FindManyOptions<FindEntityByParams & { isSystem: boolean }> = {
				// Construct the where clause based on parameters
				where: {
					tenantId: IsNull(),
					organizationId: IsNull(),
					projectId: IsNull(),
					organizationTeamId: IsNull(),
					isSystem: true
				}
			};

			// Retrieve entities and their count
			const [items, total] = await this.typeOrmRepository.findAndCount(options as FindManyOptions<BaseEntity>);

			return { items, total };
		} catch (error) {
			this.logger.error(`Error while getting base entities: ${error}`);
		}
	}

	/**
	 * GET status filter query
	 *
	 * @param query
	 * @param request
	 * @returns
	 */
	getFilterQuery(query: SelectQueryBuilder<BaseEntity>, request: FindEntityByParams): SelectQueryBuilder<BaseEntity> {
		const { organizationId, projectId, organizationTeamId } = request;

		/**
		 * GET by tenant level
		 */
		if (isNotEmpty(request.tenantId)) {
			const tenantId = RequestContext.currentTenantId() || request.tenantId;
			query.andWhere(p(`"${query.alias}"."tenantId" = :tenantId`), { tenantId });
		} else {
			query.andWhere(p(`"${query.alias}"."tenantId" IS NULL`));
		}
		/**
		 * GET by organization level
		 */
		if (isNotEmpty(organizationId)) {
			query.andWhere(p(`"${query.alias}"."organizationId" = :organizationId`), { organizationId });
		} else {
			query.andWhere(p(`"${query.alias}"."organizationId" IS NULL`));
		}
		/**
		 * GET by project level
		 */
		if (isNotEmpty(projectId)) {
			query.andWhere(p(`"${query.alias}"."projectId" = :projectId`), { projectId });
		} else {
			query.andWhere(p(`"${query.alias}"."projectId" IS NULL`));
		}

		/**
		 * GET by team level
		 */
		if (isNotEmpty(organizationTeamId)) {
			query.andWhere(p(`"${query.alias}"."organizationTeamId" = :organizationTeamId`), { organizationTeamId });
		} else {
			query.andWhere(p(`"${query.alias}"."organizationTeamId" IS NULL`));
		}
		return query;
	}
}
