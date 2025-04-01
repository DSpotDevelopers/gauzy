import { Injectable, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere } from 'typeorm';
import { IOrganizationTaskSetting, IOrganizationTaskSettingFindInput } from '@gauzy/contracts';
import { RequestContext } from './../core/context';
import { TenantAwareCrudService } from '../core/crud';
import { OrganizationTaskSetting } from './organization-task-setting.entity';
import { TypeOrmOrganizationTaskSettingRepository } from './repository';
import { Logger } from '../logger';

@Injectable()
export class OrganizationTaskSettingService extends TenantAwareCrudService<OrganizationTaskSetting> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(OrganizationTaskSetting)
		private readonly typeOrmOrganizationTaskSettingRepository: TypeOrmOrganizationTaskSettingRepository
	) {
		super(typeOrmOrganizationTaskSettingRepository);
	}

	/**
	 * Find organization task setting.
	 *
	 * @param options - The options to filter the organization task setting.
	 * @returns A Promise resolving to the found organization task setting.
	 */
	async findByOrganization(options: IOrganizationTaskSettingFindInput): Promise<IOrganizationTaskSetting> {
		try {
			const tenantId = RequestContext.currentTenantId();
			const { organizationId } = options;

			const whereConditions: FindOptionsWhere<IOrganizationTaskSettingFindInput> = {
				organizationId,
				tenantId,
				isActive: true,
				isArchived: false
			};

			return await this.findOneByOptions({ where: whereConditions });
		} catch (error) {
			// Handle errors during the retrieving operation.
			this.logger.error(`Error during organization task settings retrieval: ${error}`);
		}
	}
}
