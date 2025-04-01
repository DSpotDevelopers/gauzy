import { Injectable } from '@nestjs/common';
import { TenantAwareCrudService } from './../core/crud';
import { ProductOptionTranslation } from './../core/entities/internal';
import { InjectRepository } from '@nestjs/typeorm';
import { IProductOptionTranslatable, IProductOptionTranslation } from '@gauzy/contracts';
import { ProductOption } from './product-option.entity';
import { TypeOrmProductOptionTranslationRepository, TypeOrmProductOptionRepository } from './repository';

@Injectable()
export class ProductOptionService extends TenantAwareCrudService<ProductOption> {
	constructor(
		@InjectRepository(ProductOption)
		private readonly typeOrmProductOptionRepository: TypeOrmProductOptionRepository,

		@InjectRepository(ProductOptionTranslation)
		private readonly typeOrmProductOptionTranslationRepository: TypeOrmProductOptionTranslationRepository
	) {
		super(typeOrmProductOptionRepository);
	}

	async saveProductOptionTranslations(
		translationsInput: ProductOptionTranslation[]
	): Promise<ProductOptionTranslation[]> {
		return this.typeOrmProductOptionTranslationRepository.save(translationsInput);
	}

	async saveProductOptionTranslation(translationInput: ProductOptionTranslation): Promise<ProductOptionTranslation> {
		return this.typeOrmProductOptionTranslationRepository.save(translationInput);
	}

	async save(productOptionInput: IProductOptionTranslatable): Promise<ProductOption> {
		return this.typeOrmRepository.save(productOptionInput);
	}

	async saveBulk(productOptionsInput: ProductOption[]): Promise<ProductOption[]> {
		return this.typeOrmRepository.save(productOptionsInput);
	}

	async deleteBulk(productOptionsInput: IProductOptionTranslatable[]) {
		return this.typeOrmRepository.remove(productOptionsInput as any);
	}

	async deleteOptionTranslationsBulk(productOptionTranslationsInput: IProductOptionTranslation[]) {
		return this.typeOrmProductOptionTranslationRepository.remove(productOptionTranslationsInput as any);
	}
}
