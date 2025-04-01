import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CandidateEducation } from './candidate-education.entity';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmCandidateEducationRepository } from './repository';

@Injectable()
export class CandidateEducationService extends TenantAwareCrudService<CandidateEducation> {
	constructor(
		@InjectRepository(CandidateEducation)
		private readonly typeOrmCandidateEducationRepository: TypeOrmCandidateEducationRepository
	) {
		super(typeOrmCandidateEducationRepository);
	}
}
