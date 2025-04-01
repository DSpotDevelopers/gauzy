import { InjectRepository } from '@nestjs/typeorm';
import { IMerchant } from '@gauzy/contracts';
import { TenantAwareCrudService } from './../core/crud';
import { Merchant } from './merchant.entity';
import { TypeOrmMerchantRepository } from './repository';

export class MerchantService extends TenantAwareCrudService<Merchant> {
	constructor(
		@InjectRepository(Merchant)
		private readonly typeOrmMerchantRepository: TypeOrmMerchantRepository
	) {
		super(typeOrmMerchantRepository);
	}

	async findById(id: IMerchant['id'], relations: string[] = []): Promise<IMerchant> {
		return await this.findOneByIdString(id, { relations });
	}

	async update(id: IMerchant['id'], merchant: Merchant): Promise<IMerchant> {
		return await this.typeOrmRepository.save({ id, ...merchant });
	}
}
