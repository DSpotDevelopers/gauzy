import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Like } from 'typeorm';
import { IPagination } from '@gauzy/contracts';
import { isNotEmpty } from '@gauzy/common';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmEquipmentRepository } from './repository';
import { Equipment } from './equipment.entity';

@Injectable()
export class EquipmentService extends TenantAwareCrudService<Equipment> {
	constructor(
		@InjectRepository(Equipment)
		private readonly typeOrmEquipmentRepository: TypeOrmEquipmentRepository
	) {
		super(typeOrmEquipmentRepository);
	}

	/**
	 *
	 * @returns
	 */
	async getAll(): Promise<IPagination<Equipment>> {
		return await this.findAll({
			relations: {
				image: true,
				equipmentSharings: true,
				tags: true
			}
		});
	}

	/**
	 *
	 * @param filter
	 * @returns
	 */
	public pagination(filter: any) {
		if ('where' in filter) {
			const { where } = filter;
			['name', 'type', 'serialNumber'].forEach((param) => {
				if (param in where) {
					const value = where[param];
					if (isNotEmpty(value)) filter.where[param] = Like(`%${value}%`);
				}
			});
		}
		return super.paginate(filter);
	}
}
