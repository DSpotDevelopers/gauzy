import { Injectable, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import { FeatureEnum, IFeature, IPagination } from '@gauzy/contracts';
import { gauzyToggleFeatures } from '@gauzy/config';
import { Feature } from './feature.entity';
import { CrudService } from '../core/crud/crud.service';
import { TypeOrmFeatureRepository } from './repository';
import { Logger } from '../logger';
@Injectable()
export class FeatureService extends CrudService<Feature> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(Feature)
		private readonly typeOrmFeatureRepository: TypeOrmFeatureRepository
	) {
		super(typeOrmFeatureRepository);
	}

	/**
	 * Retrieves top-level features (those with no parent) from the database. Allows specifying related entities
	 * to be included in the result. Features are ordered by their creation time in ascending order.
	 *
	 * @param relations An array of strings indicating which related entities to include in the result.
	 * @returns A promise resolving to a paginated response containing top-level IFeature objects.
	 */
	async getParentFeatures(relations: string[] = []): Promise<IPagination<IFeature>> {
		return await super.findAll({
			where: {
				parentId: IsNull()
			},
			relations,
			order: {
				createdAt: 'ASC'
			}
		});
	}

	/**
	 * Checks if the specified feature flag is enabled.
	 * @param flag The feature flag to check.
	 * @returns A boolean indicating whether the feature flag is enabled.
	 */
	public async isFeatureEnabled(flag: FeatureEnum): Promise<boolean> {
		try {
			const featureFlag = await super.findOneByWhereOptions({ code: flag });
			return featureFlag.isEnabled;
		} catch (error) {
			this.logger.error(`Failed to check if feature ${flag} is enabled: ${error}`);
			return !!gauzyToggleFeatures[flag];
		}
	}
}
