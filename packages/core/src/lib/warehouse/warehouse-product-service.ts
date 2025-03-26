import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm';
import {
	IPagination,
	IWarehouseProduct,
	IWarehouseProductCreateInput,
	IWarehouseProductVariant
} from '@gauzy/contracts';
import { TenantAwareCrudService } from './../core/crud';
import { RequestContext } from './../core/context';
import { WarehouseProduct, WarehouseProductVariant, Product, Warehouse } from './../core/entities/internal';
import {
	TypeOrmWarehouseProductVariantRepository,
	TypeOrmWarehouseRepository,
	TypeOrmWarehouseProductRepository
} from './repository';
import { TypeOrmProductRepository } from './../product/repository';

@Injectable()
export class WarehouseProductService extends TenantAwareCrudService<WarehouseProduct> {
	constructor(
		@InjectRepository(WarehouseProduct)
		private readonly typeOrmWarehouseProductRepository: TypeOrmWarehouseProductRepository,

		@InjectRepository(Warehouse)
		private readonly typeOrmWarehouseRepository: TypeOrmWarehouseRepository,

		@InjectRepository(WarehouseProductVariant)
		private readonly typeOrmWarehouseProductVariantRepository: TypeOrmWarehouseProductVariantRepository,

		@InjectRepository(Product)
		private readonly typeOrmProductRepository: TypeOrmProductRepository
	) {
		super(typeOrmWarehouseProductRepository);
	}

	/**
	 *
	 * @param warehouseId
	 * @returns
	 */
	async getAllWarehouseProducts(warehouseId: string): Promise<IWarehouseProduct[]> {
		return await this.typeOrmRepository.find({
			where: {
				warehouseId,
				tenantId: RequestContext.currentTenantId()
			},
			relations: {
				product: true,
				variants: {
					variant: true
				}
			}
		});
	}

	async createWarehouseProductBulk(
		warehouseProductCreateInput: IWarehouseProductCreateInput[],
		warehouseId: string
	): Promise<IPagination<IWarehouseProduct[]>> {
		const productIds = warehouseProductCreateInput.map((pr) => pr.productId);
		const tenantId = RequestContext.currentTenantId();
		const warehouse = await this.typeOrmWarehouseRepository.findOneBy({
			id: warehouseId,
			tenantId
		});
		const products = await this.typeOrmProductRepository.find({
			where: {
				id: In(productIds),
				tenantId
			},
			relations: {
				variants: true
			}
		});
		const warehouseProductArr = await Promise.all(
			products.map(async (product) => {
				const newWarehouseProduct = new WarehouseProduct();
				newWarehouseProduct.warehouse = warehouse;
				newWarehouseProduct.product = product;
				newWarehouseProduct.organizationId = warehouse.organizationId;
				newWarehouseProduct.tenantId = tenantId;

				const warehouseVariants = await Promise.all(
					product.variants.map(async (variant) => {
						const warehouseVariant = new WarehouseProductVariant();
						warehouseVariant.variant = variant;

						warehouseVariant.organizationId = warehouse.organizationId;
						warehouseVariant.tenantId = tenantId;

						return this.typeOrmWarehouseProductVariantRepository.save(warehouseVariant);
					})
				);

				newWarehouseProduct.variants = warehouseVariants;
				return newWarehouseProduct;
			})
		);

		const result = await this.typeOrmRepository.save(warehouseProductArr);

		return { items: [result], total: result ? result.length : 0 };
	}

	async updateWarehouseProductQuantity(warehouseProductId: string, quantity: number): Promise<IWarehouseProduct> {
		const warehouseProduct = await this.typeOrmRepository.findOneBy({ id: warehouseProductId });
		warehouseProduct.quantity = quantity;
		return this.typeOrmRepository.save(warehouseProduct);
	}

	async updateWarehouseProductVariantQuantity(
		warehouseProductVariantId: string,
		quantity: number
	): Promise<IWarehouseProductVariant> {
		const warehouseProductVariant = await this.typeOrmWarehouseProductVariantRepository.findOne({
			where: {
				id: warehouseProductVariantId
			},
			relations: {
				warehouseProduct: true
			}
		});
		warehouseProductVariant.quantity = quantity;

		const updatedVariant = await this.typeOrmWarehouseProductVariantRepository.save(warehouseProductVariant);

		const warehouseProduct = await this.typeOrmRepository.findOne({
			where: {
				id: warehouseProductVariant.warehouseProduct.id
			},
			relations: {
				variants: true
			}
		});
		const sumQuantity = warehouseProduct.variants.map((v) => +v.quantity).reduce((prev, current) => prev + current);

		if (warehouseProduct.quantity < sumQuantity) {
			warehouseProduct.quantity = +warehouseProduct.quantity + sumQuantity - warehouseProduct.quantity;
		}

		await this.typeOrmRepository.save(warehouseProduct);
		return updatedVariant;
	}
}
