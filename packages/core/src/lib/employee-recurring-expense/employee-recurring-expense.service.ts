import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { EmployeeRecurringExpense } from './employee-recurring-expense.entity';
import { TypeOrmEmployeeRecurringExpenseRepository } from './repository';

@Injectable()
export class EmployeeRecurringExpenseService extends TenantAwareCrudService<EmployeeRecurringExpense> {
	constructor(
		@InjectRepository(EmployeeRecurringExpense)
		private readonly typeOrmEmployeeRecurringExpenseRepository: TypeOrmEmployeeRecurringExpenseRepository
	) {
		super(typeOrmEmployeeRecurringExpenseRepository);
	}
}
