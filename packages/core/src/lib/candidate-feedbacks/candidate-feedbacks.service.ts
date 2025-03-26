import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICandidateFeedback, ICandidateInterview } from '@gauzy/contracts';
import { RequestContext } from './../core/context';
import { TenantAwareCrudService } from './../core/crud';
import { CandidateFeedback } from './candidate-feedbacks.entity';
import { TypeOrmCandidateFeedbackRepository } from './repository';

@Injectable()
export class CandidateFeedbacksService extends TenantAwareCrudService<CandidateFeedback> {
	constructor(
		@InjectRepository(CandidateFeedback)
		private readonly typeOrmCandidateFeedbackRepository: TypeOrmCandidateFeedbackRepository
	) {
		super(typeOrmCandidateFeedbackRepository);
	}

	/**
	 *
	 * @param interviewId
	 * @returns
	 */
	async getFeedbacksByInterviewId(interviewId: ICandidateInterview['id']): Promise<ICandidateFeedback[]> {
		return await super.find({
			where: {
				interviewId,
				tenantId: RequestContext.currentTenantId()
			}
		});
	}

	/**
	 *
	 * @param feedbacks
	 * @returns
	 */
	calcRating(feedbacks: ICandidateFeedback[]) {
		const rate: number[] = [];
		feedbacks.forEach((fb) => {
			rate.push(Number(fb.rating));
		});
		const fbSum = rate.reduce((sum, current) => {
			return sum + current;
		}, 0);
		return fbSum / feedbacks.length;
	}
}
