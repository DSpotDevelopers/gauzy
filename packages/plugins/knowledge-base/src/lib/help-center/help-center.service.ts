import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IHelpCenter } from '@gauzy/contracts';
import { TenantAwareCrudService } from '@gauzy/core';
import { isNotEmpty } from '@gauzy/common';
import { HelpCenter } from './help-center.entity';
import { TypeOrmHelpCenterRepository } from './repository';

@Injectable()
export class HelpCenterService extends TenantAwareCrudService<HelpCenter> {
	constructor(
		@InjectRepository(HelpCenter)
		private readonly typeOrmHelpCenterRepository: TypeOrmHelpCenterRepository
	) {
		super(typeOrmHelpCenterRepository);
	}

	async updateBulk(updateInput: IHelpCenter[]) {
		return await this.typeOrmRepository.save(updateInput);
	}

	async deleteBulkByBaseId(ids: string[]) {
		if (isNotEmpty(ids)) {
			return await this.typeOrmRepository.delete(ids);
		}
	}

	async getCategoriesByBaseId(baseId: string): Promise<HelpCenter[]> {
		return await this.typeOrmRepository
			.createQueryBuilder('knowledge_base')
			.where('knowledge_base.parentId = :baseId', {
				baseId
			})
			.getMany();
	}

	async getAllNodes(): Promise<HelpCenter[]> {
		return await this.typeOrmRepository.createQueryBuilder('knowledge_base').getMany();
	}
}
