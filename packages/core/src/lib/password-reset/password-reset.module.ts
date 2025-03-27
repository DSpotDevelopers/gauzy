import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandHandlers } from './commands/handlers';
import { PasswordReset } from './password-reset.entity';
import { PasswordResetService } from './password-reset.service';
import { TypeOrmPasswordResetRepository } from './repository';

@Module({
	imports: [TypeOrmModule.forFeature([PasswordReset])],
	providers: [PasswordResetService, TypeOrmPasswordResetRepository, ...CommandHandlers],
	exports: [TypeOrmModule, PasswordResetService, TypeOrmPasswordResetRepository]
})
export class PasswordResetModule { }
