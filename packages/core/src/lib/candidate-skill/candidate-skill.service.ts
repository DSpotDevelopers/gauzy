import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmCandidateSkillRepository } from './repository';
import { CandidateSkill } from './candidate-skill.entity';

@Injectable()
export class CandidateSkillService extends TenantAwareCrudService<CandidateSkill> {
	constructor(
		@InjectRepository(CandidateSkill)
		private readonly typeOrmCandidateSkillRepository: TypeOrmCandidateSkillRepository
	) {
		super(typeOrmCandidateSkillRepository);
	}
}
