import { BadRequestException, HttpException, HttpStatus, Injectable, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial } from 'typeorm';
import { IImageAsset } from '@gauzy/contracts';
import { RequestContext } from './../core/context';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmImageAssetRepository } from './repository';
import { ImageAsset } from './image-asset.entity';
import { Logger } from '../logger';
@Injectable()
export class ImageAssetService extends TenantAwareCrudService<ImageAsset> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(ImageAsset)
		private readonly typeOrmImageAssetRepository: TypeOrmImageAssetRepository
	) {
		super(typeOrmImageAssetRepository);
	}

	/**
	 * Create image asset
	 *
	 * @param entity
	 * @returns
	 */
	public async create(entity: DeepPartial<ImageAsset>): Promise<IImageAsset> {
		const user = RequestContext.currentUser();
		try {
			return await super.create(entity);
		} catch (error) {
			this.logger.error(`Error while creating image assets for user (${user.name}): ${error}`);
			throw new BadRequestException(error);
		}
	}

	async deleteAsset(imageId: string): Promise<ImageAsset> {
		const result = await this.typeOrmRepository.findOne({
			where: { id: imageId },
			relations: ['productGallery', 'productFeaturedImage']
		});

		if (result && (result.productGallery.length || result.productFeaturedImage.length)) {
			throw new HttpException('Image is under use', HttpStatus.BAD_REQUEST);
		}

		return this.typeOrmRepository.remove(result);
	}
}
