import { forwardRef, Inject, Injectable, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IFeature, IFeatureOrganization, IFeatureOrganizationUpdateInput, ITenant } from '@gauzy/contracts';
import { isNotEmpty } from '@gauzy/common';
import { TenantAwareCrudService } from './../core/crud';
import { RequestContext } from './../core/context';
import { FeatureOrganization } from './feature-organization.entity';
import { FeatureService } from './feature.service';
import { TypeOrmFeatureOrganizationRepository } from './repository';
import { Logger } from '../logger';

@Injectable()
export class FeatureOrganizationService extends TenantAwareCrudService<FeatureOrganization> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(FeatureOrganization)
		private readonly typeOrmFeatureOrganizationRepository: TypeOrmFeatureOrganizationRepository,

		@Inject(forwardRef(() => FeatureService))
		private readonly _featureService: FeatureService
	) {
		super(typeOrmFeatureOrganizationRepository);
	}

	/**
	 * UPDATE feature organization respective tenant by feature id
	 *
	 * @param input
	 * @returns
	 */
	async updateFeatureOrganization(entity: IFeatureOrganizationUpdateInput): Promise<boolean> {
		const tenantId = RequestContext.currentTenantId();
		const { featureId, organizationId } = entity;

		// find all feature organization by feature id
		const { items: featureOrganizations, total } = await this.findAll({
			where: {
				tenantId,
				featureId,
				...(isNotEmpty(organizationId) ? { organizationId } : {})
			}
		});

		try {
			if (!total) {
				const featureOrganization: IFeatureOrganization = new FeatureOrganization({
					...entity,
					tenantId
				});
				await this.typeOrmRepository.save(featureOrganization);
			} else {
				featureOrganizations.forEach((item: IFeatureOrganization) => {
					Object.assign(item, {
						...entity,
						tenantId
					});
				});
				await this.typeOrmRepository.save(featureOrganizations);
			}
			return true;
		} catch (error) {
			this.logger.error(`Error while updating feature organization: ${error}`);
			return false;
		}
	}

	/**
	 * Create/Update feature organization for relative tenants.
	 *
	 * @param tenants An array of ITenant instances.
	 * @returns A Promise resolving to an array of IFeatureOrganization.
	 */
	public async updateTenantFeatureOrganizations(tenants: ITenant[]): Promise<IFeatureOrganization[]> {
		if (!tenants.length) {
			return [];
		}

		const featureOrganizations: IFeatureOrganization[] = [];
		const features: IFeature[] = await this._featureService.find();

		for (const feature of features) {
			const isEnabled = feature.isEnabled;
			const tenantFeatureOrganizations = tenants.map(
				(tenant) =>
					new FeatureOrganization({
						isEnabled,
						tenant,
						feature
					})
			);

			featureOrganizations.push(...tenantFeatureOrganizations);
		}

		return await this.typeOrmRepository.save(featureOrganizations);
	}
}
