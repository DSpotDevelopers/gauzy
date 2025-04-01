import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RelationId } from 'typeorm';
import { ICandidateDocument, ICandidate } from '@gauzy/contracts';
import { IsString } from 'class-validator';
import { Candidate, TenantOrganizationBaseEntity } from '../core/entities/internal';
import { ColumnIndex, MultiORMColumn, MultiORMEntity, MultiORMManyToOne } from './../core/decorators/entity';

@MultiORMEntity('candidate_document')
export class CandidateDocument extends TenantOrganizationBaseEntity implements ICandidateDocument {
	@ApiProperty({ type: () => String })
	@MultiORMColumn()
	name: string;

	@ApiPropertyOptional({ type: () => String })
	@MultiORMColumn({ nullable: true })
	documentUrl: string;

	/*
	|--------------------------------------------------------------------------
	| @ManyToOne
	|--------------------------------------------------------------------------
	*/
	@ApiPropertyOptional({ type: () => Candidate })
	@MultiORMManyToOne(() => Candidate, (candidate) => candidate.documents, {
		onDelete: 'CASCADE'
	})
	candidate?: ICandidate;

	@ApiProperty({ type: () => String })
	@RelationId((it: CandidateDocument) => it.candidate)
	@IsString()
	@ColumnIndex()
	@MultiORMColumn({ nullable: true, relationId: true })
	candidateId?: string;
}
