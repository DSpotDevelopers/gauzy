import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IWarehouse } from '@gauzy/contracts';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmWarehouseRepository } from './repository';
import { Warehouse } from './warehouse.entity';

@Injectable()
export class WarehouseService extends TenantAwareCrudService<Warehouse> {
	constructor(
		@InjectRepository(Warehouse)
		private readonly typeOrmWarehouseRepository: TypeOrmWarehouseRepository
	) {
		super(typeOrmWarehouseRepository);
	}

	/**
	 *
	 * @param id
	 * @param relations
	 * @returns
	 */
	async findById(id: IWarehouse['id'], relations: string[] = []): Promise<IWarehouse> {
		return await super.findOneByIdString(id, { relations });
	}
}
