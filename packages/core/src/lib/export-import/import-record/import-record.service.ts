import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../../core/crud';
import { ImportRecord } from './../../core/entities/internal';
import { TypeOrmImportRecordRepository } from './repository';

@Injectable()
export class ImportRecordService extends TenantAwareCrudService<ImportRecord> {
	constructor(
		@InjectRepository(ImportRecord)
		private readonly typeOrmImportRecordRepository: TypeOrmImportRecordRepository
	) {
		super(typeOrmImportRecordRepository);
	}
}
