import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from '../core/crud/crud.service';
import { Country } from './country.entity';
import { TypeOrmCountryRepository } from './repository';

@Injectable()
export class CountryService extends CrudService<Country> {
	constructor(
		@InjectRepository(Country)
		private readonly typeOrmCountryRepository: TypeOrmCountryRepository
	) {
		super(typeOrmCountryRepository);
	}
}
