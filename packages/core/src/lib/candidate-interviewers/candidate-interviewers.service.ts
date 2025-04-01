import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICandidateInterviewersDeleteInput, ICandidateInterviewersCreateInput } from '@gauzy/contracts';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmCandidateInterviewersRepository } from './repository';
import { CandidateInterviewers } from './candidate-interviewers.entity';

@Injectable()
export class CandidateInterviewersService extends TenantAwareCrudService<CandidateInterviewers> {
	constructor(
		@InjectRepository(CandidateInterviewers)
		private readonly typeOrmCandidateInterviewersRepository: TypeOrmCandidateInterviewersRepository
	) {
		super(typeOrmCandidateInterviewersRepository);
	}

	/**
	 *
	 * @param interviewId
	 * @returns
	 */
	async getInterviewersByInterviewId(interviewId: string): Promise<CandidateInterviewers[]> {
		return await this.typeOrmRepository
			.createQueryBuilder('candidate_interviewer')
			.where('candidate_interviewer.interviewId = :interviewId', {
				interviewId
			})
			.getMany();
	}

	/**
	 *
	 * @param employeeId
	 * @returns
	 */
	async getInterviewersByEmployeeId(employeeId: ICandidateInterviewersDeleteInput): Promise<any> {
		return await this.typeOrmRepository
			.createQueryBuilder('candidate_interviewer')
			.where('candidate_interviewer.employeeId = :employeeId', {
				employeeId
			})
			.getMany();
	}

	/**
	 *
	 * @param ids
	 * @returns
	 */
	async deleteBulk(ids: string[]) {
		return await this.typeOrmRepository.delete(ids);
	}

	/**
	 *
	 * @param createInput
	 * @returns
	 */
	async createBulk(createInput: ICandidateInterviewersCreateInput[]) {
		return await this.typeOrmRepository.save(createInput);
	}
}
