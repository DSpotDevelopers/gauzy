import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { EquipmentSharingPolicy } from './equipment-sharing-policy.entity';
import { TypeOrmEquipmentSharingPolicyRepository } from './repository';

@Injectable()
export class EquipmentSharingPolicyService extends TenantAwareCrudService<EquipmentSharingPolicy> {
	constructor(
		@InjectRepository(EquipmentSharingPolicy)
		private readonly typeOrmEquipmentSharingPolicyRepository: TypeOrmEquipmentSharingPolicyRepository
	) {
		super(typeOrmEquipmentSharingPolicyRepository);
	}
}
