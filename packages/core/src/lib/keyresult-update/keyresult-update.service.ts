import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyResultUpdate } from './keyresult-update.entity';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmKeyResultUpdateRepository } from './repository';

@Injectable()
export class KeyResultUpdateService extends TenantAwareCrudService<KeyResultUpdate> {
	constructor(
		@InjectRepository(KeyResultUpdate)
		private readonly typeOrmKeyResultUpdateRepository: TypeOrmKeyResultUpdateRepository
	) {
		super(typeOrmKeyResultUpdateRepository);
	}

	/**
	 *
	 * @param keyResultId
	 * @returns
	 */
	async findByKeyResultId(keyResultId: string): Promise<KeyResultUpdate[]> {
		return await this.typeOrmRepository
			.createQueryBuilder('key_result_update')
			.where('key_result_update.keyResultId = :keyResultId', {
				keyResultId
			})
			.getMany();
	}

	/**
	 *
	 * @param ids
	 * @returns
	 */
	async deleteBulkByKeyResultId(ids: string[]) {
		return await this.typeOrmRepository.delete(ids);
	}
}
