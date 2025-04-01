import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { CandidateDocument } from './candidate-documents.entity';
import { TypeOrmCandidateDocumentRepository } from './repository';

@Injectable()
export class CandidateDocumentsService extends TenantAwareCrudService<CandidateDocument> {
	constructor(
		@InjectRepository(CandidateDocument)
		private readonly typeOrmCandidateDocumentsRepository: TypeOrmCandidateDocumentRepository
	) {
		super(typeOrmCandidateDocumentsRepository);
	}
}
