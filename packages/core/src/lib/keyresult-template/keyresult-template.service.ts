import { Injectable } from '@nestjs/common';
import { TenantAwareCrudService } from './../core/crud';
import { KeyResultTemplate } from './keyresult-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmKeyResultTemplateRepository } from './repository';

@Injectable()
export class KeyresultTemplateService extends TenantAwareCrudService<KeyResultTemplate> {
	constructor(
		@InjectRepository(KeyResultTemplate)
		private readonly typeOrmKeyResultTemplateRepository: TypeOrmKeyResultTemplateRepository
	) {
		super(typeOrmKeyResultTemplateRepository);
	}
}
