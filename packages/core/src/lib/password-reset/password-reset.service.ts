import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from './../core/crud';
import { PasswordReset } from './password-reset.entity';
import { TypeOrmPasswordResetRepository } from './repository';

@Injectable()
export class PasswordResetService extends CrudService<PasswordReset> {
	constructor(
		@InjectRepository(PasswordReset)
		private readonly typeOrmPasswordResetRepository: TypeOrmPasswordResetRepository
	) {
		super(typeOrmPasswordResetRepository);
	}
}
