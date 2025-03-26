import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from '../core/crud';
import { ReportCategory } from './report-category.entity';
import { TypeOrmReportCategoryRepository } from './repository';

@Injectable()
export class ReportCategoryService extends CrudService<ReportCategory> {
	constructor(
		@InjectRepository(ReportCategory)
		private readonly typeOrmReportCategoryRepository: TypeOrmReportCategoryRepository
	) {
		super(typeOrmReportCategoryRepository);
	}
}
