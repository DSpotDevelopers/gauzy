import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyResult } from './keyresult.entity';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmKeyResultRepository } from './repository';

@Injectable()
export class KeyResultService extends TenantAwareCrudService<KeyResult> {
	constructor(
		@InjectRepository(KeyResult)
		private readonly typeOrmKeyResultRepository: TypeOrmKeyResultRepository
	) {
		super(typeOrmKeyResultRepository);
	}

	/**
	 *
	 * @param input
	 * @returns
	 */
	async createBulk(input: KeyResult[]) {
		return await this.typeOrmRepository.save(input);
	}
}
