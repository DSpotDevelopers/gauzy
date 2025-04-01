import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmEventTypeRepository } from './repository';
import { EventType } from './event-type.entity';

@Injectable()
export class EventTypeService extends TenantAwareCrudService<EventType> {
	constructor(
		@InjectRepository(EventType)
		private readonly typeOrmEventTypeRepository: TypeOrmEventTypeRepository
	) {
		super(typeOrmEventTypeRepository);
	}
}
