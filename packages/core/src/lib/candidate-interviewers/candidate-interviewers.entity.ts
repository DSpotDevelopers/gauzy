import { RelationId } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ICandidateInterviewers, ICandidateInterview, IEmployee } from '@gauzy/contracts';
import { CandidateInterview, Employee, TenantOrganizationBaseEntity } from '../core/entities/internal';
import { IsString } from 'class-validator';
import { ColumnIndex, MultiORMColumn, MultiORMEntity, MultiORMManyToOne } from './../core/decorators/entity';

@MultiORMEntity('candidate_interviewer')
export class CandidateInterviewers extends TenantOrganizationBaseEntity implements ICandidateInterviewers {
	/*
	|--------------------------------------------------------------------------
	| @ManyToOne
	|--------------------------------------------------------------------------
	*/
	@ApiProperty({ type: () => CandidateInterview })
	@MultiORMManyToOne(() => CandidateInterview, (interview) => interview.interviewers, {
		onDelete: 'CASCADE'
	})
	interview: ICandidateInterview;

	@ApiProperty({ type: () => String })
	@RelationId((it: CandidateInterviewers) => it.interview)
	@IsString()
	@ColumnIndex()
	@MultiORMColumn({ relationId: true })
	interviewId: string;

	@ApiProperty({ type: () => Employee })
	@MultiORMManyToOne(() => Employee, {
		onDelete: 'CASCADE'
	})
	employee: IEmployee;

	@ApiProperty({ type: () => String })
	@RelationId((it: CandidateInterviewers) => it.employee)
	@IsString()
	@ColumnIndex()
	@MultiORMColumn({ nullable: true, relationId: true })
	employeeId: string;
}
