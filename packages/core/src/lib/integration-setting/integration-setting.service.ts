import { Injectable, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IIntegrationSetting, IIntegrationTenant } from '@gauzy/contracts';
import { TenantAwareCrudService } from './../core/crud';
import { IntegrationSetting } from './integration-setting.entity';
import { TypeOrmIntegrationSettingRepository } from './repository';
import { Logger } from '../logger';
@Injectable()
export class IntegrationSettingService extends TenantAwareCrudService<IntegrationSetting> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(IntegrationSetting)
		private readonly typeOrmIntegrationSettingRepository: TypeOrmIntegrationSettingRepository
	) {
		super(typeOrmIntegrationSettingRepository);
	}

	/**
	 * Bulk update or create integration settings for a specific integration.
	 *
	 * @param integrationId - The identifier of the integration for which settings are updated or created.
	 * @param input - An array of integration settings or a single integration setting to update or create.
	 * @returns {Promise<IIntegrationSetting[]>} - A promise that resolves with an array of updated or created integration settings.
	 */
	async bulkUpdateOrCreate(
		integrationId: IIntegrationTenant['id'],
		input: IIntegrationSetting | IIntegrationSetting[]
	): Promise<IIntegrationSetting[]> {
		try {
			// Delete existing settings for the given integration
			await this.delete({ integrationId });

			// Prepare an array of settings to be saved
			const settings: IIntegrationSetting[] = Array.isArray(input) ? input : [input];

			// Save the new settings to the database
			return await this.typeOrmIntegrationSettingRepository.save(settings);
		} catch (error) {
			// Handle any errors that occur during the bulk update or create process
			this.logger.error(`Bulk update or create of integration settings failed: ${error}`);
		}
	}
}
