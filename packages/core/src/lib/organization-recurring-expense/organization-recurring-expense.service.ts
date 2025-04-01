import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { OrganizationRecurringExpense } from './organization-recurring-expense.entity';
import { TypeOrmOrganizationRecurringExpenseRepository } from './repository';

@Injectable()
export class OrganizationRecurringExpenseService extends TenantAwareCrudService<OrganizationRecurringExpense> {
	constructor(
		@InjectRepository(OrganizationRecurringExpense)
		private readonly typeOrmOrganizationRecurringExpenseRepository: TypeOrmOrganizationRecurringExpenseRepository
	) {
		super(typeOrmOrganizationRecurringExpenseRepository);
	}
}
