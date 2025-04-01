import { BadRequestException, Injectable, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult } from 'typeorm';
import {
	IOrganization,
	IPagination,
	ITaskVersion,
	ITaskVersionCreateInput,
	ITaskVersionFindInput,
	ITenant
} from '@gauzy/contracts';
import { TaskStatusPrioritySizeService } from '../task-status-priority-size.service';
import { RequestContext } from '../../core/context';
import { TaskVersion } from './version.entity';
import { DEFAULT_GLOBAL_VERSIONS } from './default-global-versions';
import { TypeOrmTaskVersionRepository } from './repository';
import { Logger } from '../../logger';

@Injectable()
export class TaskVersionService extends TaskStatusPrioritySizeService<TaskVersion> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(TaskVersion)
		private readonly typeOrmTaskVersionRepository: TypeOrmTaskVersionRepository
	) {
		super(typeOrmTaskVersionRepository);
	}

	/**
	 * GET versions by filters
	 * If parameters not match, retrieve global versions
	 *
	 * @param params
	 * @returns
	 */
	async fetchAll(params: ITaskVersionFindInput): Promise<IPagination<TaskVersion>> {
		try {
			return await super.fetchAll(params);
		} catch (error) {
			this.logger.error(`Failed to retrieve task versions: ${error}`);
			throw new BadRequestException(
				'Failed to retrieve task versions. Ensure that the provided parameters are valid and complete.',
				error
			);
		}
	}

	/**
	 * Few Versions can't be removed/delete because they are global
	 *
	 * @param id
	 * @returns
	 */
	async delete(id: ITaskVersion['id']): Promise<DeleteResult> {
		return await super.delete(id, {
			where: {
				isSystem: false
			}
		});
	}

	/**
	 * Create bulk versions for specific tenants
	 *
	 * @param tenants '
	 */
	async bulkCreateTenantsVersions(tenants: ITenant[]): Promise<ITaskVersion[] & TaskVersion[]> {
		const versions: ITaskVersion[] = [];
		for (const tenant of tenants) {
			for (const version of DEFAULT_GLOBAL_VERSIONS) {
				versions.push(
					new TaskVersion({
						...version,
						icon: `ever-icons/${version.icon}`,
						isSystem: false,
						tenant
					})
				);
			}
		}
		return await this.typeOrmRepository.save(versions);
	}

	/**
	 * Create bulk versions for specific organization
	 *
	 * @param organization
	 */
	async bulkCreateOrganizationVersions(organization: IOrganization): Promise<ITaskVersion[] & TaskVersion[]> {
		try {
			const tenantId = RequestContext.currentTenantId();
			const { items = [] } = await super.fetchAll({ tenantId });

			const versions: ITaskVersion[] = [];
			for (const item of items) {
				const { tenantId, name, value, description, icon, color } = item;
				const version = new TaskVersion({
					tenantId,
					name,
					value,
					description,
					icon,
					color,
					organization,
					isSystem: false
				});
				versions.push(version);
			}
			return await this.typeOrmRepository.save(versions);
		} catch (error) {
			this.logger.error(`Failed to create bulk task versions for organization: ${error}`);
			throw new BadRequestException(error);
		}
	}

	/**
	 * Create bulk versions for specific organization entity
	 *
	 * @param entity
	 * @returns
	 */
	async createBulkVersionsByEntity(entity: Partial<ITaskVersionCreateInput>): Promise<ITaskVersion[]> {
		try {
			const { organizationId } = entity;
			const tenantId = RequestContext.currentTenantId();

			const { items = [] } = await this.fetchAll({
				tenantId,
				organizationId
			});

			const versions: ITaskVersion[] = [];
			for (const item of items) {
				const { name, value, description, icon, color } = item;

				const version = await this.create({
					...entity,
					name,
					value,
					description,
					icon,
					color,
					isSystem: false
				});
				versions.push(version);
			}
			return versions;
		} catch (error) {
			this.logger.error(`Failed to create bulk task versions by entity: ${error}`);
			throw new BadRequestException(error);
		}
	}
}
