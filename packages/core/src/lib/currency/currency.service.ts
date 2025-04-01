import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from '../core/crud/crud.service';
import { TypeOrmCurrencyRepository } from './repository';
import { Currency } from './currency.entity';

@Injectable()
export class CurrencyService extends CrudService<Currency> {
	constructor(
		@InjectRepository(Currency)
		private readonly typeOrmCurrencyRepository: TypeOrmCurrencyRepository
	) {
		super(typeOrmCurrencyRepository);
	}
}
