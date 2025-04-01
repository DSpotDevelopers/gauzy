import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { ProductVariantPrice } from './product-variant-price.entity';
import { TypeOrmProductVariantPriceRepository } from './repository';

@Injectable()
export class ProductVariantPriceService extends TenantAwareCrudService<ProductVariantPrice> {
	constructor(
		@InjectRepository(ProductVariantPrice)
		private readonly typeOrmProductVariantPriceRepository: TypeOrmProductVariantPriceRepository
	) {
		super(typeOrmProductVariantPriceRepository);
	}

	/**
	 *
	 * @returns
	 */
	async createDefaultProductVariantPrice(): Promise<ProductVariantPrice> {
		const newProductVariantPrice = new ProductVariantPrice();
		return this.typeOrmRepository.save(newProductVariantPrice);
	}

	/**
	 *
	 * @param productVariantPrices
	 * @returns
	 */
	async deleteMany(productVariantPrices: ProductVariantPrice[]): Promise<ProductVariantPrice[]> {
		return this.typeOrmRepository.remove(productVariantPrices);
	}
}
