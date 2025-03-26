import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from '@gauzy/core';
import { Video } from '../entities/video.entity';
import { TypeOrmVideoRepository } from '../repositories';
@Injectable()
export class VideosService extends TenantAwareCrudService<Video> {
	constructor(
		@InjectRepository(Video)
		private readonly typeOrmVideoRepository: TypeOrmVideoRepository
	) {
		super(typeOrmVideoRepository);
	}
}
