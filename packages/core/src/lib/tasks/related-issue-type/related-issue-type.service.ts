import { BadRequestException, Injectable, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult } from 'typeorm';
import {
	IOrganization,
	IPagination,
	ITaskRelatedIssueType,
	ITaskRelatedIssueTypeCreateInput,
	ITaskRelatedIssueTypeFindInput
} from '@gauzy/contracts';
import { TaskStatusPrioritySizeService } from '../task-status-priority-size.service';
import { RequestContext } from '../../core/context';
import { TaskRelatedIssueType } from './related-issue-type.entity';
import { TypeOrmTaskRelatedIssueTypeRepository } from './repository';
import { Logger } from '../../logger';

@Injectable()
export class TaskRelatedIssueTypeService extends TaskStatusPrioritySizeService<TaskRelatedIssueType> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(TaskRelatedIssueType)
		private readonly typeOrmTaskRelatedIssueTypeRepository: TypeOrmTaskRelatedIssueTypeRepository
	) {
		super(typeOrmTaskRelatedIssueTypeRepository);
	}

	/**
	 * GET statuses by filters
	 * If parameters not match, retrieve global statuses
	 *
	 * @param params
	 * @returns
	 */
	async fetchAll(params: ITaskRelatedIssueTypeFindInput): Promise<IPagination<TaskRelatedIssueType>> {
		try {
			return await super.fetchAll(params);
		} catch (error) {
			this.logger.error(`Failed to retrieve related issue types for tasks: ${error}`);
			throw new BadRequestException(
				'Failed to retrieve related issue types for tasks. Please ensure that the provided parameters are valid and complete.',
				error
			);
		}
	}

	/**
	 * Few RelatedIssueTypes can't be removed/delete because they are global
	 *
	 * @param id
	 * @returns
	 */
	async delete(id: ITaskRelatedIssueType['id']): Promise<DeleteResult> {
		return await super.delete(id, {
			where: {
				isSystem: false
			}
		});
	}

	/**
	 * Create bulk statuses for specific organization
	 *
	 * @param organization
	 */
	async bulkCreateOrganizationRelatedIssueTypes(
		organization: IOrganization
	): Promise<ITaskRelatedIssueType[] & TaskRelatedIssueType[]> {
		try {
			const statuses: ITaskRelatedIssueType[] = [];

			const tenantId = RequestContext.currentTenantId();
			const { items = [] } = await super.fetchAll({ tenantId });

			for (const item of items) {
				const { tenantId, name, value, description, icon, color } = item;
				const status = new TaskRelatedIssueType({
					tenantId,
					name,
					value,
					description,
					icon,
					color,
					organization,
					isSystem: false
				});
				statuses.push(status);
			}
			return await this.typeOrmRepository.save(statuses);
		} catch (error) {
			this.logger.error(`Failed to create bulk statuses for specific organization: ${error}`);
			throw new BadRequestException(error);
		}
	}

	/**
	 * Create bulk statuses for specific organization entity
	 *
	 * @param entity
	 * @returns
	 */
	async createBulkRelatedIssueTypesByEntity(
		entity: Partial<ITaskRelatedIssueTypeCreateInput>
	): Promise<ITaskRelatedIssueType[]> {
		try {
			const { organizationId } = entity;
			const tenantId = RequestContext.currentTenantId();

			const statuses: ITaskRelatedIssueType[] = [];
			const { items = [] } = await super.fetchAll({
				tenantId,
				organizationId
			});

			for (const item of items) {
				const { name, value, description, icon, color } = item;

				const status = await this.create({
					...entity,
					name,
					value,
					description,
					icon,
					color,
					isSystem: false
				});
				statuses.push(status);
			}

			return statuses;
		} catch (error) {
			this.logger.error(`Failed to create bulk related issue types by entity: ${error}`);
			throw new BadRequestException(error);
		}
	}
}
