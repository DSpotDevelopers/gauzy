import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmContactRepository } from './repository';
import { Contact } from './contact.entity';

@Injectable()
export class ContactService extends TenantAwareCrudService<Contact> {
	constructor(
		@InjectRepository(Contact)
		private readonly typeOrmContactRepository: TypeOrmContactRepository
	) {
		super(typeOrmContactRepository);
	}
}
