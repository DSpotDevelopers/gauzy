import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPagination } from '@gauzy/contracts';
import { TenantAwareCrudService } from './../../core/crud';
import { ImportHistory } from './import-history.entity';
import { TypeOrmImportHistoryRepository } from './repository';

@Injectable()
export class ImportHistoryService extends TenantAwareCrudService<ImportHistory> {
	constructor(
		@InjectRepository(ImportHistory)
		private readonly typeOrmImportHistoryRepository: TypeOrmImportHistoryRepository
	) {
		super(typeOrmImportHistoryRepository);
	}

	/**
	 *
	 * @returns
	 */
	public async findAll(): Promise<IPagination<ImportHistory>> {
		try {
			return await super.findAll({
				order: {
					importDate: 'DESC'
				}
			});
		} catch (error) {
			throw new BadRequestException(error);
		}
	}
}
