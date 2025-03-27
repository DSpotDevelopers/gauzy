import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionModule } from '../role-permission/role-permission.module';
import { UserModule } from '../user/user.module';
import { CommandHandlers } from './commands/handlers';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { TypeOrmCommentRepository } from './repository';

@Module({
	imports: [
		RouterModule.register([{ path: '/comment', module: CommentModule }]),
		TypeOrmModule.forFeature([Comment]),
		RolePermissionModule,
		UserModule,
		CqrsModule
	],
	providers: [CommentService, TypeOrmCommentRepository, ...CommandHandlers],
	controllers: [CommentController],
	exports: [CommentService, TypeOrmModule, TypeOrmCommentRepository]
})
export class CommentModule { }
