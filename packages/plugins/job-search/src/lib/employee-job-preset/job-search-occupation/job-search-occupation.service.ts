import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from '@gauzy/core';
import { JobSearchOccupation } from './job-search-occupation.entity';
import { TypeOrmJobSearchOccupationRepository } from './repository';

@Injectable()
export class JobSearchOccupationService extends TenantAwareCrudService<JobSearchOccupation> {
	constructor(
		@InjectRepository(JobSearchOccupation)
		private readonly typeOrmJobSearchOccupationRepository: TypeOrmJobSearchOccupationRepository
	) {
		super(typeOrmJobSearchOccupationRepository);
	}
}
