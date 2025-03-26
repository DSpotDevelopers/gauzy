import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmExpenseCategoryRepository } from './repository';
import { ExpenseCategory } from './expense-category.entity';

@Injectable()
export class ExpenseCategoriesService extends TenantAwareCrudService<ExpenseCategory> {
	constructor(
		@InjectRepository(ExpenseCategory)
		private readonly typeOrmExpenseCategoryRepository: TypeOrmExpenseCategoryRepository
	) {
		super(typeOrmExpenseCategoryRepository);
	}
}
