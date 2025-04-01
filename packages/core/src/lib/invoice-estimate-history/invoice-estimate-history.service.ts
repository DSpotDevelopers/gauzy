import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { TenantAwareCrudService } from './../core/crud';
import { InvoiceEstimateHistory } from './invoice-estimate-history.entity';
import { TypeOrmInvoiceEstimateHistoryRepository } from './repository';

@Injectable()
export class InvoiceEstimateHistoryService extends TenantAwareCrudService<InvoiceEstimateHistory> {
	constructor(
		@InjectRepository(InvoiceEstimateHistory)
		private readonly typeOrmInvoiceEstimateHistoryRepository: TypeOrmInvoiceEstimateHistoryRepository
	) {
		super(typeOrmInvoiceEstimateHistoryRepository);
	}
}
