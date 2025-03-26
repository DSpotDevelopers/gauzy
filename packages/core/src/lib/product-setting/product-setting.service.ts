import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from '../core/crud';
import { ProductVariantSetting } from './product-setting.entity';
import { TypeOrmProductVariantSettingRepository } from './repository';

@Injectable()
export class ProductVariantSettingService extends TenantAwareCrudService<ProductVariantSetting> {
	constructor(
		@InjectRepository(ProductVariantSetting)
		private readonly typeOrmProductVariantSettingRepository: TypeOrmProductVariantSettingRepository
	) {
		super(typeOrmProductVariantSettingRepository);
	}

	/**
	 *
	 * @returns
	 */
	async createDefaultVariantSettings(): Promise<ProductVariantSetting> {
		const newProductVariantSettings = new ProductVariantSetting();
		return this.typeOrmRepository.save(newProductVariantSettings);
	}

	/**
	 *
	 * @param productVariantPrices
	 * @returns
	 */
	async deleteMany(productVariantPrices: ProductVariantSetting[]): Promise<ProductVariantSetting[]> {
		return this.typeOrmRepository.remove(productVariantPrices);
	}
}
