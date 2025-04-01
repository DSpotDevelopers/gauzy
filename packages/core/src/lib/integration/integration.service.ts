import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from '../core/crud';
import { Integration } from './integration.entity';
import { TypeOrmIntegrationRepository } from './repository';

@Injectable()
export class IntegrationService extends CrudService<Integration> {
	constructor(
		@InjectRepository(Integration)
		private readonly typeOrmIntegrationRepository: TypeOrmIntegrationRepository
	) {
		super(typeOrmIntegrationRepository);
	}
}
