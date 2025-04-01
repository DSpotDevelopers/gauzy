import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IInvoiceItemCreateInput } from '@gauzy/contracts';
import { TenantAwareCrudService } from './../core/crud';
import { InvoiceItem } from './invoice-item.entity';
import { TypeOrmInvoiceItemRepository } from './repository';

@Injectable()
export class InvoiceItemService extends TenantAwareCrudService<InvoiceItem> {
	constructor(
		@InjectRepository(InvoiceItem)
		private readonly typeOrmInvoiceItemRepository: TypeOrmInvoiceItemRepository
	) {
		super(typeOrmInvoiceItemRepository);
	}

	/**
	 *
	 * @param invoiceId
	 * @param createInput
	 * @returns
	 */
	async createBulk(invoiceId: string, createInput: IInvoiceItemCreateInput[]) {
		await this.typeOrmRepository.delete({ invoiceId: invoiceId });
		return await this.typeOrmRepository.save(createInput);
	}
}
